/**
 * ローカルWebhookサーバーにトリガーを送信する
 * WEBHOOK_URL が未設定の場合は何もしない（cronがフォールバック）
 */
export async function triggerWebhook(orderId: string, event: string = "order.new"): Promise<void> {
  const url = process.env.WEBHOOK_URL;
  if (!url) return;

  const secret = process.env.WEBHOOK_SECRET || "";

  try {
    await fetch(`${url}/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify({ orderId, event }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Webhookが失敗してもAPIレスポンスは成功させる（cronがフォールバック）
  }
}
