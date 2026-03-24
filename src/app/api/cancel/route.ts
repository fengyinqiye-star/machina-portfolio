import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { checkRateLimit, isValidOrderId } from "@/lib/rateLimit";

type Sub = Stripe.Subscription;

// GET: 解約プレビュー（返金見込み額を返す）
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await checkRateLimit(`cancel-get:${ip}`);
  if (!rl.allowed) return NextResponse.json({ error: "リクエストが多すぎます" }, { status: 429 });

  const orderId = new URL(request.url).searchParams.get("orderId") ?? "";
  if (!isValidOrderId(orderId)) return NextResponse.json({ error: "無効なorderId" }, { status: 422 });
  if (!stripe) return NextResponse.json({ error: "決済システム未設定" }, { status: 503 });

  const sub = await findSubscription(orderId);
  if (!sub) return NextResponse.json({ active: false });

  const refundAmount = calcRefundAmount(sub);
  // current_period_end は number (Unix timestamp)
  const periodEndTs = (sub as unknown as { current_period_end: number }).current_period_end;
  const periodEnd = new Date(periodEndTs * 1000).toLocaleDateString("ja-JP");

  return NextResponse.json({
    active: true,
    plan: sub.metadata?.plan ?? "unknown",
    periodEnd,
    refundAmount,
  });
}

// POST: 解約実行（日割り返金 → サブスクリプションキャンセル → 確認メール）
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await checkRateLimit(`cancel-post:${ip}`);
  if (!rl.allowed) return NextResponse.json({ error: "リクエストが多すぎます" }, { status: 429 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { orderId } = body as { orderId: string };
  if (!orderId || !isValidOrderId(orderId)) {
    return NextResponse.json({ error: "無効なorderId" }, { status: 422 });
  }
  if (!stripe) return NextResponse.json({ error: "決済システム未設定" }, { status: 503 });

  const sub = await findSubscription(orderId);
  if (!sub) {
    return NextResponse.json({ error: "有効な保守プランが見つかりません" }, { status: 404 });
  }

  const refundAmount = calcRefundAmount(sub);
  let refundId: string | null = null;

  // 日割り返金（返金額 > 0 の場合）
  if (refundAmount > 0) {
    const latestInvoice = sub.latest_invoice;
    const invoiceId = typeof latestInvoice === "string" ? latestInvoice : latestInvoice?.id;
    if (invoiceId) {
      const invoice = await stripe.invoices.retrieve(invoiceId) as unknown as { payment_intent?: string | { id: string } | null };
      const paymentIntent = typeof invoice.payment_intent === "string"
        ? invoice.payment_intent
        : (invoice.payment_intent as { id: string } | null)?.id ?? null;
      if (paymentIntent) {
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntent,
          amount: refundAmount,
          reason: "requested_by_customer",
          metadata: { orderId, type: "proration" },
        });
        refundId = refund.id;
      }
    }
  }

  // サブスクリプションをキャンセル
  await stripe.subscriptions.cancel(sub.id);

  const toEmail = sub.metadata?.toEmail ?? "";
  const contactName = sub.metadata?.contactName ?? "お客様";
  const projectName = sub.metadata?.projectName ?? orderId;
  const cancelledAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  // Blobにキャンセル記録を保存
  if (process.env.VERCEL_ENV) {
    try {
      const { put } = await import("@vercel/blob");
      await put(
        `orders/${orderId}/subscription-cancelled.md`,
        [
          `# 保守プラン解約`,
          ``,
          `解約日時: ${cancelledAt}`,
          `返金額: ¥${refundAmount}`,
          `返金ID: ${refundId ?? "なし"}`,
          `プラン: ${sub.metadata?.plan ?? "unknown"}`,
        ].join("\n"),
        { access: "private", contentType: "text/markdown", allowOverwrite: true }
      );
    } catch { /* ログのみ */ }
  }

  if (toEmail) {
    const { sendCancellationConfirmation } = await import("@/lib/email");
    await sendCancellationConfirmation({
      to: toEmail, contactName, projectName, orderId, refundAmount, cancelledAt,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true, refundAmount, refundId });
}

// --- helpers ---

async function findSubscription(orderId: string): Promise<Sub | null> {
  if (!stripe) return null;
  try {
    const result = await stripe.subscriptions.search({
      query: `metadata['orderId']:'${orderId}' AND status:'active'`,
      limit: 1,
    });
    return result.data[0] ?? null;
  } catch {
    const subs = await stripe.subscriptions.list({ limit: 100, status: "active" });
    return subs.data.find(s => s.metadata?.orderId === orderId) ?? null;
  }
}

function calcRefundAmount(sub: Sub): number {
  const now = Math.floor(Date.now() / 1000);
  // Stripe v2026 では current_period_* は items 経由になる場合があるため unknown キャスト
  const raw = sub as unknown as { current_period_start: number; current_period_end: number };
  const totalSec = raw.current_period_end - raw.current_period_start;
  const unusedSec = raw.current_period_end - now;
  if (unusedSec <= 0 || totalSec <= 0) return 0;

  const unitAmount = sub.items.data[0]?.price?.unit_amount ?? 0;
  return Math.floor(unitAmount * (unusedSec / totalSec));
}
