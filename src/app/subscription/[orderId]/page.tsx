"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type SubscriptionInfo = {
  status: "active" | "canceled" | "none";
  plan?: string;
  planLabel?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  amount?: number;
};

const PLAN_LABELS: Record<string, string> = {
  light: "ライト",
  standard: "スタンダード",
  premium: "プレミアム",
};

const PLAN_PRICES: Record<string, string> = {
  light: "¥2,980 / 月",
  standard: "¥4,980 / 月",
  premium: "¥19,800 / 月",
};

const PLAN_FEATURES: Record<string, string[]> = {
  light: ["月2回までの軽微な修正", "バグ修正対応", "メールサポート（3営業日以内）"],
  standard: ["修正対応（回数無制限）", "バグ修正・機能追加（軽微）", "優先メールサポート（1営業日以内）", "月次レポート"],
  premium: ["修正・機能追加（無制限）", "機能追加・デザイン変更", "専任AIエージェント対応（即日）", "月次改善提案レポート", "アクセス解析レポート"],
};

function SubscriptionContent() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/subscription/status?orderId=${encodeURIComponent(orderId)}`)
      .then((r) => r.json())
      .then((data) => { setInfo(data); setLoading(false); })
      .catch(() => { setInfo({ status: "none" }); setLoading(false); });
  }, [orderId]);

  const handlePortal = () => {
    window.location.href = `/api/subscription/portal?orderId=${encodeURIComponent(orderId)}`;
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#e8e5df]">
      <div className="fixed top-0 left-0 right-0 h-px bg-[#a8e63a]" />

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-16">
        <p className="text-[#a8e63a] text-xs tracking-[0.25em] uppercase font-mono mb-12">
          Machina / プラン管理
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-none mb-2">
          保守プラン
        </h1>
        <p className="font-mono text-xs text-[#555250] mb-10">{orderId}</p>

        {loading ? (
          <p className="text-[#555250] font-mono text-sm animate-pulse">読み込み中...</p>
        ) : info?.status === "active" ? (
          <>
            {/* 現在のプラン */}
            <div className="border border-[#1E1E1C] p-6 mb-8">
              <p className="text-xs tracking-[0.2em] uppercase text-[#555250] font-mono mb-4">現在のプラン</p>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-2xl font-bold" style={{ color: "#a8e63a" }}>
                  {PLAN_LABELS[info.plan ?? ""] ?? info.plan}
                </span>
                <span className="font-mono text-sm text-[#888]">
                  {PLAN_PRICES[info.plan ?? ""] ?? (info.amount ? `¥${info.amount.toLocaleString()} / 月` : "")}
                </span>
              </div>

              {info.currentPeriodEnd && (
                <p className="font-mono text-xs text-[#555250] mt-2">
                  {info.cancelAtPeriodEnd
                    ? `⚠️ 解約済み — ${new Date(info.currentPeriodEnd).toLocaleDateString("ja-JP")} まで有効`
                    : `次回更新日: ${new Date(info.currentPeriodEnd).toLocaleDateString("ja-JP")}`}
                </p>
              )}

              {/* プラン特典リスト */}
              {info.plan && PLAN_FEATURES[info.plan] && (
                <ul className="mt-4 space-y-1">
                  {PLAN_FEATURES[info.plan].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-[#88857f]">
                      <span className="text-[#a8e63a]">✓</span> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Stripe Customer Portal へのCTA */}
            <div className="space-y-3">
              <button
                onClick={handlePortal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#a8e63a] text-[#0D0D0D] font-bold text-sm font-mono hover:bg-[#bdf048] transition-colors"
              >
                Stripeポータルで管理する →
              </button>
              <p className="text-xs text-[#444440] font-mono">
                請求情報の変更・解約はStripeの安全なポータルで行えます
              </p>
            </div>
          </>
        ) : (
          <>
            {/* プランなし → アップセル */}
            <p className="text-[#88857f] mb-8">
              現在、保守プランにご加入されていません。<br />
              継続的なサポート・修正対応が必要な場合はプランをご検討ください。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#1E1E1C] mb-8">
              {(["light", "standard", "premium"] as const).map((plan) => (
                <div key={plan} className="bg-[#0D0D0D] p-5 flex flex-col">
                  <p className="text-xs tracking-widest uppercase font-mono mb-2" style={{ color: "#a8e63a" }}>
                    {PLAN_LABELS[plan]}
                  </p>
                  <p className="text-lg font-bold mb-3">{PLAN_PRICES[plan]}</p>
                  <ul className="space-y-1 mb-4 flex-1">
                    {PLAN_FEATURES[plan].map((f) => (
                      <li key={f} className="text-xs text-[#555250] flex items-start gap-1.5">
                        <span className="text-[#a8e63a] mt-0.5">·</span> {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`/api/stripe/subscribe?orderId=${encodeURIComponent(orderId)}&plan=${plan}`}
                    className="text-center text-xs font-mono py-2 border transition-colors"
                    style={
                      plan === "standard"
                        ? { borderColor: "#a8e63a", color: "#a8e63a" }
                        : { borderColor: "#333", color: "#888" }
                    }
                  >
                    このプランを選ぶ
                  </a>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#444440] font-mono">
              ※ 契約後はStripeの安全な決済で月額課金されます。いつでもキャンセル可能です。
            </p>
          </>
        )}

        <div className="mt-12 pt-8 border-t border-[#1E1E1C]">
          <Link
            href={`/status/${orderId}`}
            className="font-mono text-xs text-[#555250] hover:text-[#a8e63a] transition-colors"
          >
            ← 進捗ページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense>
      <SubscriptionContent />
    </Suspense>
  );
}
