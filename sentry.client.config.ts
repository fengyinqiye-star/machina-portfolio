import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 本番のみ有効化
  environment: process.env.NODE_ENV,

  // パフォーマンストレース（10%サンプリング）
  tracesSampleRate: 0.1,

  // セッションリプレイ（エラー時のみキャプチャ）
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
