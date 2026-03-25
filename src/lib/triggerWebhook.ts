/**
 * Webhookトリガー（二重送信で信頼性を確保）
 *
 * 1. ローカルWebhookサーバーに即時通知（PCが起動中なら即座に処理）
 * 2. Upstash Redisキューに保存（PCが落ちていても5分以内に自動回収）
 */
export async function triggerWebhook(orderId: string, event: string = "order.new"): Promise<void> {
  // --- 1. Webhookサーバーへ即時通知（失敗しても続行） ---
  const url = process.env.WEBHOOK_URL;
  if (url) {
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
      // 失敗してもRedisキューでフォールバック
    }
  }

  // --- 2. Upstash Redisキューに保存（PCオフライン時のフォールバック） ---
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken) return;

  try {
    const payload = JSON.stringify({ orderId, event, queuedAt: new Date().toISOString() });
    await fetch(`${redisUrl}/rpush/machina:webhook-queue/${encodeURIComponent(payload)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${redisToken}` },
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Redisへの保存失敗はサイレントに無視（cronが5分後に回収）
  }
}
