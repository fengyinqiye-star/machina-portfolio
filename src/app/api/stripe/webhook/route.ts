import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

async function pauseVercelProject(projectId: string) {
  const token = process.env.VERCEL_TOKEN;
  if (!token || !projectId) return;

  const res = await fetch(`https://api.vercel.com/v1/projects/${projectId}/pause`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    console.log(`[stripe/webhook] Vercelプロジェクト停止: ${projectId}`);
  } else {
    const body = await res.text();
    console.error(`[stripe/webhook] Vercel停止失敗 (${res.status}): ${body}`);
  }
}

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
      console.log(`[stripe/webhook] 支払い完了: ${orderId} — 開発開始`);

      try {
        const triggerScript = path.resolve(process.cwd(), "..", "..", "..", "scripts", "trigger-order.sh");
        const agent = spawn("bash", [triggerScript, orderId], {
          detached: true,
          stdio: "ignore",
          cwd: path.resolve(process.cwd(), "..", "..", ".."),
        });
        agent.unref();
      } catch (err) {
        console.error("[stripe/webhook] エージェント起動失敗:", err);
      }
    }

    // サブスクリプション申込み完了
    if (session.mode === "subscription" && orderId) {
      const plan = session.metadata?.plan ?? "unknown";
      console.log(`[stripe/webhook] 保守プラン申込み: ${orderId} (${plan})`);
    }
  }

  // サブスクリプション解約 → Vercelプロジェクト停止
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as {
      metadata?: { orderId?: string; plan?: string; vercelProjectId?: string };
    };
    const orderId = subscription.metadata?.orderId;
    const vercelProjectId = subscription.metadata?.vercelProjectId;

    console.log(`[stripe/webhook] 保守プラン解約: ${orderId} — Vercelプロジェクト停止`);

    if (vercelProjectId) {
      await pauseVercelProject(vercelProjectId);
    } else {
      console.warn(`[stripe/webhook] vercelProjectId未設定 — 停止スキップ (orderId: ${orderId})`);
    }
  }

  return NextResponse.json({ received: true });
}
