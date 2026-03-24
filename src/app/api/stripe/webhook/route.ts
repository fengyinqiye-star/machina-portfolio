import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";


export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe未設定" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    return NextResponse.json({ error: "Webhook設定不備" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] 署名検証失敗:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 支払い完了（初回受注の一括払い）
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      mode?: string;
      metadata?: { orderId?: string; plan?: string; vercelProjectId?: string };
    };
    const orderId = session.metadata?.orderId;

    if (session.mode === "payment" && orderId) {
      console.log(`[stripe/webhook] 支払い完了: ${orderId} — payment-received.md をBlobに保存`);

      // Vercel Blob に payment-received.md を書き込む
      // → check-new-orders.sh がローカルに同期して開発をトリガーする
      try {
        const { put } = await import("@vercel/blob");
        const content = `# 支払い完了\n\n受付日時: ${new Date().toISOString()}\n案件ID: ${orderId}\n`;
        await put(`orders/${orderId}/payment-received.md`, content, {
          access: "private",
          contentType: "text/markdown",
        });
        console.log(`[stripe/webhook] payment-received.md 保存完了: ${orderId}`);
        // Webhookサーバーに即時通知
        const { triggerWebhook } = await import("@/lib/triggerWebhook");
        triggerWebhook(orderId, "payment.received").catch(() => {});
      } catch (err) {
        console.error("[stripe/webhook] Blob書き込み失敗:", err);
        // ローカル環境ではフォールバックとして直接トリガー
        if (!process.env.VERCEL_ENV) {
          try {
            const { spawn } = await import("child_process");
            const triggerScript = path.resolve(process.cwd(), "..", "..", "..", "scripts", "trigger-order.sh");
            const agent = spawn("bash", [triggerScript, orderId], {
              detached: true,
              stdio: "ignore",
              cwd: path.resolve(process.cwd(), "..", "..", ".."),
            });
            agent.unref();
          } catch (e) {
            console.error("[stripe/webhook] ローカルトリガー失敗:", e);
          }
        }
      }
    }

    // サブスクリプション申込み完了
    if (session.mode === "subscription" && orderId) {
      const plan = session.metadata?.plan ?? "unknown";
      console.log(`[stripe/webhook] 保守プラン申込み: ${orderId} (${plan})`);
    }
  }

  // サブスクリプション解約 → 14日猶予期間を設定してBlob保存 + 通知メール
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as {
      metadata?: {
        orderId?: string;
        plan?: string;
        vercelProjectId?: string;
        githubRepo?: string;
        toEmail?: string;
        contactName?: string;
        projectName?: string;
      };
    };
    const meta = subscription.metadata ?? {};
    const orderId = meta.orderId;
    const vercelProjectId = meta.vercelProjectId;
    const githubRepo = meta.githubRepo ?? "";
    const toEmail = meta.toEmail ?? "";
    const contactName = meta.contactName ?? "";
    const projectName = meta.projectName ?? "";

    const cancelledAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    console.log(`[stripe/webhook] 保守プラン解約: ${orderId} — 14日猶予期間設定`);

    // Vercel Blob に解約情報を保存
    if (orderId) {
      try {
        const { put } = await import("@vercel/blob");
        const content = [
          `# サブスクリプション解約`,
          ``,
          `解約日時: ${cancelledAt}`,
          `猶予期間終了日: ${expiresAt}`,
          `Vercel Project ID: ${vercelProjectId ?? ""}`,
          `GitHub リポジトリ: ${githubRepo}`,
          `依頼者メール: ${toEmail}`,
          `依頼者名: ${contactName}`,
          `プロジェクト名: ${projectName}`,
          `ステータス: grace_period`,
        ].join("\n");
        await put(`orders/${orderId}/subscription-cancelled.md`, content, {
          access: "private",
          contentType: "text/markdown",
        });
        console.log(`[stripe/webhook] subscription-cancelled.md 保存完了: ${orderId}`);
      } catch (err) {
        console.error("[stripe/webhook] Blob書き込み失敗:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
