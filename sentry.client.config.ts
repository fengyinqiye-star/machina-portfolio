import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 本番のみ有効化
  environment: process.env.NODE_ENV,

  // パフォーマンストレース（10%サンプリング）
  tracesSampleRate: 0.1,

  // Replay SDKはバンドルサイズが大きくLighthouseに影響するため無効化
});
