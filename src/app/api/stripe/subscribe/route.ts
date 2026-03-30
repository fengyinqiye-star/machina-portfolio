import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// 保守プランの価格ID（月額3,000円 固定）
const PLAN_PRICES: Record<string, string> = {
  light: "price_1TGexwBLGjf6t2zyQnFid79H",  // 月額3,000円
};

// brief.md から顧客情報を取得（Stripe Customer Portal解約時のメール通知に使用）
async function fetchBriefInfo(orderId: string): Promise<{ toEmail: string; contactName: string; projectName: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return { toEmail: "", contactName: "", projectName: "" };
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: `orders/${orderId}/brief.md`, token });
    if (blobs.length === 0) return { toEmail: "", contactName: "", projectName: "" };
    const res = await fetch(blobs[0].url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return { toEmail: "", contactName: "", projectName: "" };
    const text = await res.text();
    const toEmail = text.match(/- メールアドレス: ([^\n]+)/)?.[1]?.trim() ?? "";
    const contactName = text.match(/- お名前: ([^\n]+)/)?.[1]?.trim() ?? "";
    const projectName = text.match(/^# 案件依頼: ([^\n]+)/m)?.[1]?.trim() ?? "";
    return { toEmail, contactName, projectName };
  } catch {
    return { toEmail: "", contactName: "", projectName: "" };
  }
}

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

  // brief.md から顧客情報を取得してサブスクリプションメタデータに含める
  // → Stripe Customer Portal で直接解約された場合も webhook でメール通知が可能になる
  const { toEmail, contactName, projectName } = await fetchBriefInfo(orderId);

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
          toEmail,
          contactName,
          projectName,
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
