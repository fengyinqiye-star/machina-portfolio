"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/atoms/Button";

function ThanksContent() {
  const searchParams = useSearchParams();
  const isMaintenance = searchParams.get("maintenance") === "true";

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-6">
      <div className="text-center max-w-lg">
        <div
          className="inline-flex items-center justify-center w-16 h-16 border mb-8"
          style={{ borderColor: "var(--accent)" }}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: "var(--accent)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
          {isMaintenance ? "Subscribed" : "Received"}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
          {isMaintenance ? "保守プランに加入しました" : "受付完了しました"}
        </h1>
        {isMaintenance ? (
          <>
            <p className="text-[var(--muted)] mb-2 leading-relaxed">
              保守プランへのご加入ありがとうございます。
            </p>
            <p className="text-[var(--muted)] mb-10 leading-relaxed">
              ホスティングの維持・修正対応を継続して行います。
              ご要望はいつでもフィードバックフォームからお送りください。
            </p>
          </>
        ) : (
          <>
            <p className="text-[var(--muted)] mb-8 leading-relaxed">
              案件のご依頼ありがとうございます。
            </p>

            {/* 次のステップ */}
            <div className="text-left mb-10 space-y-4">
              {[
                { step: "1", title: "見積もりメールをお送りします", desc: "通常5〜10分以内にご登録のメールアドレスへ、ヒアリング内容・金額・支払いリンクをお送りします。" },
                { step: "2", title: "お支払いで開発スタート", desc: "メール内の「お支払いはこちら」からStripe決済。確認後すぐにAIエージェントチームが開発を開始します。" },
                { step: "3", title: "進捗を随時メールでお知らせ", desc: "要件定義・実装・テスト・納品の各フェーズ完了時に自動でご連絡します。通常24〜48時間で納品完了。" },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4 p-4 border border-[var(--border)]">
                  <span
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--accent)", color: "#111" }}
                  >
                    {step}
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--text)] text-sm mb-1">{title}</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-[var(--muted)] mb-8 leading-relaxed">
              メールが届かない場合は迷惑メールフォルダをご確認いただくか、
              <a href="https://ai-company.dev" className="underline hover:text-[var(--text)] transition-colors">サイト</a>
              よりお問い合わせください。
            </p>
          </>
        )}
        <Link href="/">
          <Button variant="primary">トップページへ戻る</Button>
        </Link>
        <p className="mt-10 text-xs text-[var(--muted)] flex items-center justify-center gap-4">
          <Link href="/legal" className="hover:text-[var(--text)] transition-colors">特定商取引法</Link>
          <Link href="/terms" className="hover:text-[var(--text)] transition-colors">利用規約</Link>
        </p>
      </div>
    </main>
  );
}

export default function ThanksPage() {
  return (
    <Suspense>
      <ThanksContent />
    </Suspense>
  );
}
