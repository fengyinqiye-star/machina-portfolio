import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// 保守プランの価格ID（Stripeダッシュボードで作成済み）
const PLAN_PRICES: Record<string, string> = {
  light: "price_1TEViUBLGjf6t2zy7fGFcp8i",     // 月額2,980円
  standard: "price_1TEViUBLGjf6t2zypbePDQIW",  // 月額4,980円
  premium: "price_1TEViUBLGjf6t2zy22tOaKSs",   // 月額19,800円
};

export async function GET(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe未設定" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const plan = searchParams.get("plan");
  const vercelProjectId = searchParams.get("vpid") ?? "";

  if (!orderId || !plan) {
    return NextResponse.json({ error: "orderId と plan が必要です" }, { status: 400 });
  }

  const priceId = PLAN_PRICES[plan];
  if (!priceId) {
    return NextResponse.json({ error: "無効なプランです" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-company.dev";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        orderId,
        plan,
        vercelProjectId,
      },
      subscription_data: {
        metadata: {
          orderId,
          plan,
          vercelProjectId,
        },
      },
      success_url: `${siteUrl}/thanks?order=${orderId}&maintenance=true`,
      cancel_url: `${siteUrl}/feedback/${orderId}`,
      locale: "ja",
    });

    return NextResponse.redirect(session.url!, 303);
  } catch (err) {
    console.error("[stripe/subscribe] セッション作成失敗:", err);
    return NextResponse.json({ error: "チェックアウト作成に失敗しました" }, { status: 500 });
  }
}
