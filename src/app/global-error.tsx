"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ja">
      <body
        style={{
          background: "#0a0a08",
          color: "#f5f4f0",
          fontFamily: "sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          gap: "24px",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: 700 }}>
          予期せぬエラーが発生しました
        </h2>
        <p style={{ color: "#88857f", fontSize: "14px" }}>
          問題は自動的に報告されました。
        </p>
        <button
          onClick={reset}
          style={{
            padding: "12px 24px",
            background: "#a8e63a",
            color: "#111",
            border: "none",
            borderRadius: "6px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          再試行する
        </button>
        <Link
          href="/"
          style={{ color: "#a8e63a", fontSize: "14px", textDecoration: "none" }}
        >
          トップに戻る
        </Link>
      </body>
    </html>
  );
}
