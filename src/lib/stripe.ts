import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
  : null;

/**
 * 案件用のStripe Payment Linkを作成する
 * contract エージェントが発注書生成時に呼び出す
 */
export async function createPaymentLink(params: {
  orderId: string;
  projectName: string;
  amountJpy: number;
  contactEmail: string;
}): Promise<string | null> {
  if (!stripe) {
    console.warn("[stripe] STRIPE_SECRET_KEY未設定 — Payment Link生成をスキップ");
    return null;
  }

  const { orderId, projectName, amountJpy } = params;

  // 1. Productを作成
  const product = await stripe.products.create({
    name: projectName,
    description: `Machina 自動開発サービス — 案件ID: ${orderId}`,
    metadata: { orderId },
  });

  // 2. Priceを作成
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amountJpy,
    currency: "jpy",
  });

  // 3. Payment Linkを作成
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { orderId, projectName },
    after_completion: {
      type: "redirect",
      redirect: { url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ai-company-portfolio.vercel.app"}/thanks?order=${orderId}&paid=true` },
    },
    customer_creation: "always",
    billing_address_collection: "required",
  });

  return paymentLink.url;
}
