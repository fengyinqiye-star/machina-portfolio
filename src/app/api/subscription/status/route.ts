import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { isValidOrderId } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const PLAN_PRICE_MAP: Record<string, string> = {
  price_1TGexwBLGjf6t2zyQnFid79H: "light",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId || !isValidOrderId(orderId)) {
    return NextResponse.json({ status: "none" });
  }

  if (!stripe) {
    return NextResponse.json({ status: "none" });
  }

  try {
    // isValidOrderId で検証済みのため安全に埋め込み可能
    const subscriptions = await stripe.subscriptions.search({
      query: `metadata['orderId']:'${orderId}'`,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ status: "none" });
    }

    const sub = subscriptions.data[0];
    const priceId = sub.items.data[0]?.price.id ?? "";
    const plan = PLAN_PRICE_MAP[priceId] ?? "unknown";

    return NextResponse.json({
      status: sub.status === "active" || sub.status === "trialing" ? "active" : "canceled",
      plan,
      currentPeriodEnd: (() => {
        const ts = (sub as unknown as Record<string, number>)["current_period_end"];
        return ts ? new Date(ts * 1000).toISOString() : null;
      })(),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      amount: sub.items.data[0]?.price.unit_amount ?? undefined,
    });
  } catch (err) {
    console.error("[subscription/status] エラー:", err);
    return NextResponse.json({ status: "none" });
  }
}
