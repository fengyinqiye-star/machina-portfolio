"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavBar } from "@/components/molecules/NavBar";

type Preview = {
  active: boolean;
  plan?: string;
  periodEnd?: string;
  refundAmount?: number;
};

export default function CancelPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/cancel?orderId=${orderId}`)
      .then(r => r.json())
      .then(setPreview)
      .catch(() => setPreview({ active: false }))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleCancel = async () => {
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "解約に失敗しました");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "解約に失敗しました");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="max-w-lg mx-auto px-6 py-24">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-8">保守プランの解約</h1>

        {loading && (
          <p className="text-[var(--muted)] text-sm">確認中...</p>
        )}

        {!loading && !preview?.active && (
          <div className="p-6 border border-[var(--border)]">
            <p className="text-[var(--muted)] text-sm">
              有効な保守プランが見つかりませんでした。<br />
              ご不明な点は <a href="mailto:autocode.2603@gmail.com" className="underline">autocode.2603@gmail.com</a> までご連絡ください。
            </p>
          </div>
        )}

        {!loading && preview?.active && !done && (
          <div className="space-y-6">
            <div className="p-6 border border-[var(--border)] space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">プラン</span>
                <span className="font-medium text-[var(--text)] capitalize">{preview.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">現在の契約期間終了日</span>
                <span className="font-medium text-[var(--text)]">{preview.periodEnd}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-3">
                <span className="text-[var(--muted)]">日割り返金予定額</span>
                <span className="font-bold text-[var(--text)]">
                  ¥{(preview.refundAmount ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              「解約する」を押すと解約手続きが完了します。解約後14日間はサービスを継続してご利用いただけます。
              返金は元のお支払い方法へ3〜5営業日で反映されます。
              解約後もGitHubのソースコードは引き続きご利用いただけます。
            </p>

            {error && (
              <p className="text-sm text-red-500 p-3 border border-red-500/30 bg-red-500/5">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="flex-1 py-3 border border-[var(--border)] text-sm text-[var(--muted)] hover:border-[var(--text)] transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleCancel}
                disabled={confirming}
                className="flex-1 py-3 border border-red-500 text-sm text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
              >
                {confirming ? "処理中..." : "解約する"}
              </button>
            </div>
          </div>
        )}

        {done && (
          <div className="p-6 border border-[var(--border)] space-y-3">
            <p className="font-semibold text-[var(--text)]">解約が完了しました</p>
            <p className="text-sm text-[var(--muted)]">
              返金額 ¥{(preview?.refundAmount ?? 0).toLocaleString()} を元のお支払い方法へ返金します。<br />
              確認メールをお送りしましたのでご確認ください。
            </p>
          </div>
        )}
      </main>
    </>
  );
}
