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
  if (!redisUrl || !redisToken) {
    // Redisが未設定でも check-new-orders.sh が Blob から定期スキャンするため消失リスクは低い
    console.warn(`[triggerWebhook] WARN: Upstash Redis未設定 — orderId=${orderId} はBlobスキャンで回収される`);
    return;
  }

  try {
    const payload = JSON.stringify({ orderId, event, queuedAt: new Date().toISOString() });
    await fetch(`${redisUrl}/rpush/machina:webhook-queue/${encodeURIComponent(payload)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${redisToken}` },
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    // Redisへの保存失敗: Vercelログに記録（check-new-orders.sh の Blob定期スキャンがフォールバック）
    console.error(`[triggerWebhook] ERROR: Redisキュー保存失敗 — orderId=${orderId} event=${event}`, err);
  }
}
