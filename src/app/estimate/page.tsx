"use client";

import { useState } from "react";
import Link from "next/link";
import { NavBar } from "@/components/molecules/NavBar";

type ProjectType = "lp" | "corporate" | "webapp" | "ec" | "booking" | "enterprise";
type FeatureKey =
  | "form"
  | "auth"
  | "db"
  | "payment"
  | "admin"
  | "api"
  | "animation"
  | "seo"
  | "multilang"
  | "booking";

const PROJECT_TYPES: { id: ProjectType; label: string; desc: string; base: number }[] = [
  { id: "lp", label: "ランディングページ（LP）", desc: "1ページ構成の集客・訴求ページ", base: 9800 },
  { id: "corporate", label: "コーポレートサイト", desc: "会社紹介・サービス案内サイト", base: 18000 },
  { id: "webapp", label: "Webアプリ", desc: "タスク管理・予約・管理ツールなど", base: 38000 },
  { id: "ec", label: "ECサイト", desc: "商品販売・カート・決済機能付き", base: 58000 },
  { id: "booking", label: "予約・管理システム", desc: "スタッフ管理画面付きの予約システム", base: 78000 },
  { id: "enterprise", label: "大規模システム", desc: "マイクロサービス・複雑な要件", base: 150000 },
];

const FEATURES: { id: FeatureKey; label: string; price: number }[] = [
  { id: "form", label: "お問い合わせ・申込フォーム", price: 0 },
  { id: "animation", label: "スクロールアニメーション", price: 5000 },
  { id: "seo", label: "SEO対策（構造化データ・OGP）", price: 5000 },
  { id: "auth", label: "ユーザー認証（ログイン）", price: 15000 },
  { id: "db", label: "データベース連携", price: 20000 },
  { id: "admin", label: "管理者ダッシュボード", price: 20000 },
  { id: "payment", label: "オンライン決済（Stripe）", price: 15000 },
  { id: "api", label: "外部API連携", price: 15000 },
  { id: "multilang", label: "多言語対応", price: 25000 },
  { id: "booking", label: "予約・カレンダー機能", price: 30000 },
];

const PAGE_OPTIONS = [
  { value: 1, label: "1ページ（LP）", multiplier: 1.0 },
  { value: 3, label: "3〜5ページ", multiplier: 1.2 },
  { value: 8, label: "6〜10ページ", multiplier: 1.5 },
  { value: 15, label: "11ページ以上", multiplier: 2.0 },
];

const URGENCY_OPTIONS = [
  { value: "normal", label: "通常（2〜4週間）", multiplier: 1.0 },
  { value: "fast", label: "急ぎ（1〜2週間）", multiplier: 1.3 },
  { value: "urgent", label: "超特急（1週間以内）", multiplier: 1.6 },
];

export default function EstimatePage() {
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [features, setFeatures] = useState<Set<FeatureKey>>(new Set());
  const [pageCount, setPageCount] = useState(PAGE_OPTIONS[1]);
  const [urgency, setUrgency] = useState(URGENCY_OPTIONS[0]);
  const [step, setStep] = useState(1);

  const toggleFeature = (id: FeatureKey) => {
    setFeatures((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const basePrice = PROJECT_TYPES.find((p) => p.id === projectType)?.base ?? 0;
  const featurePrice = Array.from(features).reduce(
    (sum, id) => sum + (FEATURES.find((f) => f.id === id)?.price ?? 0),
    0
  );
  const subtotal = (basePrice + featurePrice) * pageCount.multiplier * urgency.multiplier;
  const low = Math.round(subtotal / 1000) * 1000;
  const high = Math.round((subtotal * 1.3) / 1000) * 1000;

  const canShowResult = projectType !== null;

  return (
    <>
      <NavBar />
      <main className="bg-[var(--bg)] min-h-screen">
        {/* Hero */}
        <section className="py-20 px-6 border-b border-[var(--border)]">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
              Estimate
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
              見積もりシミュレーター
            </h1>
            <p className="text-[var(--muted)] leading-relaxed">
              作りたいものを選ぶだけで、概算費用がすぐにわかります。
              実際の金額はヒアリング後に確定します。
            </p>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Step 1: プロジェクト種別 */}
            <div>
              <p className="text-xs tracking-widest uppercase font-mono mb-1" style={{ color: "var(--accent)" }}>
                Step 1
              </p>
              <h2 className="text-xl font-bold text-[var(--text)] mb-6">作りたいものを選んでください</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROJECT_TYPES.map((pt) => (
                  <button
                    key={pt.id}
                    onClick={() => { setProjectType(pt.id); setStep(Math.max(step, 2)); }}
                    className="text-left p-4 border transition-colors"
                    style={{
                      borderColor: projectType === pt.id ? "var(--accent)" : "var(--border)",
                      background: projectType === pt.id ? "rgba(168,230,58,0.05)" : "var(--bg)",
                    }}
                  >
                    <p className="font-semibold text-sm text-[var(--text)] mb-1">{pt.label}</p>
                    <p className="text-xs text-[var(--muted)]">{pt.desc}</p>
                    <p className="text-xs font-mono mt-2" style={{ color: "var(--accent)" }}>
                      {pt.base.toLocaleString()}円〜
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: 機能選択 */}
            {step >= 2 && (
              <div>
                <p className="text-xs tracking-widest uppercase font-mono mb-1" style={{ color: "var(--accent)" }}>
                  Step 2
                </p>
                <h2 className="text-xl font-bold text-[var(--text)] mb-6">必要な機能を選んでください（複数可）</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FEATURES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { toggleFeature(f.id); setStep(Math.max(step, 3)); }}
                      className="text-left p-4 border transition-colors flex items-center justify-between"
                      style={{
                        borderColor: features.has(f.id) ? "var(--accent)" : "var(--border)",
                        background: features.has(f.id) ? "rgba(168,230,58,0.05)" : "var(--bg)",
                      }}
                    >
                      <span className="text-sm text-[var(--text)]">{f.label}</span>
                      <span className="text-xs font-mono text-[var(--muted)] ml-2 shrink-0">
                        {f.price === 0 ? "無料" : `+${f.price.toLocaleString()}円`}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(Math.max(step, 3))}
                  className="mt-4 text-xs text-[var(--muted)] underline hover:text-[var(--text)] transition-colors"
                >
                  追加機能なしでスキップ →
                </button>
              </div>
            )}

            {/* Step 3: ページ数・急ぎ度 */}
            {step >= 3 && (
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs tracking-widest uppercase font-mono mb-1" style={{ color: "var(--accent)" }}>
                    Step 3a
                  </p>
                  <h2 className="text-lg font-bold text-[var(--text)] mb-4">ページ数</h2>
                  <div className="space-y-2">
                    {PAGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setPageCount(opt); setStep(Math.max(step, 4)); }}
                        className="w-full text-left p-3 border text-sm transition-colors"
                        style={{
                          borderColor: pageCount.value === opt.value ? "var(--accent)" : "var(--border)",
                          color: pageCount.value === opt.value ? "var(--accent)" : "var(--muted)",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs tracking-widest uppercase font-mono mb-1" style={{ color: "var(--accent)" }}>
                    Step 3b
                  </p>
                  <h2 className="text-lg font-bold text-[var(--text)] mb-4">希望納期</h2>
                  <div className="space-y-2">
                    {URGENCY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setUrgency(opt); setStep(Math.max(step, 4)); }}
                        className="w-full text-left p-3 border text-sm transition-colors"
                        style={{
                          borderColor: urgency.value === opt.value ? "var(--accent)" : "var(--border)",
                          color: urgency.value === opt.value ? "var(--accent)" : "var(--muted)",
                        }}
                      >
                        {opt.label}
                        {opt.multiplier > 1 && (
                          <span className="text-xs ml-2 font-mono">×{opt.multiplier}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 見積もり結果 */}
            {canShowResult && step >= 2 && (
              <div className="border border-[var(--border)] p-8 bg-[var(--bg-2)]">
                <p className="text-xs tracking-widest uppercase font-mono mb-4" style={{ color: "var(--accent)" }}>
                  概算見積もり
                </p>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-[var(--text)]">
                    ¥{low.toLocaleString()}
                  </span>
                  <span className="text-[var(--muted)]">〜</span>
                  <span className="text-2xl font-bold text-[var(--text)]">
                    ¥{high.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] mb-6">
                  ※ あくまで概算です。ヒアリング後に正式な見積もりをお送りします（24時間以内）。
                </p>

                {/* 内訳 */}
                <div className="space-y-1 mb-6 text-sm text-[var(--muted)] font-mono border-t border-[var(--border)] pt-4">
                  <p>
                    基本料金 ({PROJECT_TYPES.find((p) => p.id === projectType)?.label}):
                    <span className="text-[var(--text)] ml-2">¥{basePrice.toLocaleString()}</span>
                  </p>
                  {Array.from(features).map((id) => {
                    const f = FEATURES.find((f) => f.id === id);
                    if (!f || f.price === 0) return null;
                    return (
                      <p key={id}>
                        {f.label}: <span className="text-[var(--text)] ml-2">+¥{f.price.toLocaleString()}</span>
                      </p>
                    );
                  })}
                  {pageCount.multiplier > 1 && (
                    <p>ページ数補正: <span className="text-[var(--text)] ml-2">×{pageCount.multiplier}</span></p>
                  )}
                  {urgency.multiplier > 1 && (
                    <p>特急料金: <span className="text-[var(--text)] ml-2">×{urgency.multiplier}</span></p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/#contact"
                    className="flex-1 text-center py-4 text-sm font-bold transition-colors"
                    style={{ background: "var(--accent)", color: "#111" }}
                  >
                    この内容で依頼する →
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex-1 text-center py-4 text-sm border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--muted)] transition-colors"
                  >
                    料金詳細を見る
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="py-10 text-center text-xs text-[var(--muted)] border-t border-[var(--border)]">
        <p className="mb-2">© 2026 Machina. All rights reserved.</p>
        <p className="flex items-center justify-center gap-4">
          <Link href="/legal" className="hover:text-[var(--text)] transition-colors">特定商取引法に基づく表記</Link>
          <Link href="/terms" className="hover:text-[var(--text)] transition-colors">利用規約</Link>
        </p>
      </footer>
    </>
  );
}
