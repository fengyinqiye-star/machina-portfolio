import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
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

  // 支払い完了イベント
  if (event.type === "payment_link.completed" || event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderId?: string } };
    const orderId = session.metadata?.orderId;

    if (orderId) {
      console.log(`[stripe/webhook] 支払い完了: ${orderId} — 開発開始`);

      // orchestratorをバックグラウンドで起動
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
  }

  return NextResponse.json({ received: true });
}
