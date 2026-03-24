// Upstash Redis が設定されていればそちらを使用、なければインメモリフォールバック

const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX ?? "5");
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? "60000");

// ---- In-memory fallback (シングルインスタンス環境のみ有効) ----
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const store = new Map<string, RateLimitEntry>();

function checkInMemory(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true };
}

// ---- Upstash Redis (本番推奨) ----
async function checkWithRedis(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const { Redis } = await import("@upstash/redis");
  const { Ratelimit } = await import("@upstash/ratelimit");

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, `${WINDOW_MS} ms`),
    analytics: false,
  });

  const { success, reset } = await ratelimit.limit(ip);
  if (!success) {
    return { allowed: false, retryAfter: Math.ceil((reset - Date.now()) / 1000) };
  }
  return { allowed: true };
}

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      return await checkWithRedis(ip);
    } catch (err) {
      console.warn("[rateLimit] Upstash Redis エラー、インメモリにフォールバック:", err);
    }
  }
  return checkInMemory(ip);
}

// orderId バリデーション（パストラバーサル防止）
// 英数字・ハイフン・アンダースコア・ドットのみ許可、40文字以内
export function isValidOrderId(orderId: string): boolean {
  return /^[a-zA-Z0-9_\-\.]{1,80}$/.test(orderId) && !orderId.includes("..");
}
