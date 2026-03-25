import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { isValidOrderId } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe未設定" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId || !isValidOrderId(orderId)) {
    return NextResponse.json({ error: "orderId が無効です" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-company.dev";

  try {
    // orderId に紐づくサブスクリプションをメタデータで検索
    // isValidOrderId で検証済みのため安全に埋め込み可能
    const subscriptions = await stripe.subscriptions.search({
      query: `metadata['orderId']:'${orderId}'`,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // サブスクリプションなし → プラン選択ページへリダイレクト
      const pricingUrl = `${siteUrl}/pricing?orderId=${encodeURIComponent(orderId)}`;
      return NextResponse.redirect(pricingUrl, 303);
    }

    const subscription = subscriptions.data[0];
    // customer は expand しない限り string だが、両形式を安全に処理
    const customerId = typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

    // Customer Portal セッションを作成
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/subscription/${encodeURIComponent(orderId)}`,
    });

    return NextResponse.redirect(portalSession.url, 303);
  } catch (err) {
    console.error("[subscription/portal] エラー:", err);
    return NextResponse.json({ error: "ポータルの作成に失敗しました" }, { status: 500 });
  }
}
