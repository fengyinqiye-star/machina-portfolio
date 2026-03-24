"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

type Phase = {
  label: string;
  sublabel: string;
  done: boolean;
  active: boolean;
};

type OrderStatus = {
  orderId: string;
  projectName: string;
  statusLabel: string;
  progressPercent: number;
  phases: Phase[];
  deployUrl: string;
  hasFailed: boolean;
  updatedAt: string;
};

function OrderStatusContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const nameFromQuery = searchParams.get("name");

  const [data, setData] = useState<OrderStatus | null>(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`/api/status/${orderId}`);
      if (!res.ok) { setError("案件が見つかりません"); return; }
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString("ja-JP"));
    } catch {
      setError("通信エラーが発生しました");
    }
  }, [orderId]);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, 30000);
    return () => clearInterval(id);
  }, [fetch_]);

  const projectName = data?.projectName ?? nameFromQuery ?? orderId;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#e8e5df]">
      <div className="fixed top-0 left-0 right-0 h-px bg-[#a8e63a]" />

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-16">
        <p className="text-[#a8e63a] text-xs tracking-[0.25em] uppercase font-mono mb-12">
          Machina / 開発進捗
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-none mb-2">
          {projectName}
        </h1>
        <p className="font-mono text-xs text-[#555250] mb-10">{orderId}</p>

        {error ? (
          <p className="text-[#f56042] font-mono">{error}</p>
        ) : !data ? (
          <p className="text-[#555250] font-mono text-sm animate-pulse">読み込み中...</p>
        ) : (
          <>
            {/* ステータスバッジ */}
            <div className="flex items-center gap-3 mb-8">
              <span
                className="text-xs font-mono tracking-widest uppercase px-3 py-1 border"
                style={{
                  color: data.hasFailed ? "#f56042" : data.progressPercent === 100 ? "#a8e63a" : "#e8e5df",
                  borderColor: data.hasFailed ? "#f56042" : data.progressPercent === 100 ? "#a8e63a" : "#333",
                }}
              >
                {data.statusLabel}
              </span>
              <span className="text-[#555250] font-mono text-xs">{data.progressPercent}%</span>
            </div>

            {/* プログレスバー */}
            <div className="w-full h-px bg-[#1E1E1C] mb-10 relative">
              <div
                className="absolute top-0 left-0 h-px bg-[#a8e63a] transition-all duration-1000"
                style={{ width: `${data.progressPercent}%` }}
              />
            </div>

            {/* フェーズリスト */}
            <div className="divide-y divide-[#1E1E1C]">
              {data.phases.map((phase, i) => (
                <div key={i} className="flex items-start gap-4 py-4">
                  <div className="mt-0.5 w-5 flex-shrink-0 flex items-center justify-center">
                    {phase.done ? (
                      <span className="text-[#a8e63a] font-mono text-sm">✓</span>
                    ) : phase.active ? (
                      <span className="w-2 h-2 rounded-full bg-[#a8e63a] animate-pulse block" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#2a2a28] block" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium"
                      style={{ color: phase.done ? "#e8e5df" : phase.active ? "#a8e63a" : "#555250" }}
                    >
                      {phase.label}
                    </p>
                    <p className="text-xs text-[#444440] mt-0.5">{phase.sublabel}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 納品URL */}
            {data.deployUrl && (
              <div className="mt-10 pt-8 border-t border-[#1E1E1C]">
                <p className="text-xs tracking-[0.2em] uppercase text-[#555250] font-mono mb-3">
                  納品物
                </p>
                <a
                  href={data.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-[#a8e63a] hover:underline break-all"
                >
                  {data.deployUrl} →
                </a>
              </div>
            )}

            {/* 更新時刻 */}
            <p className="mt-10 text-xs text-[#333] font-mono">
              最終更新: {lastUpdated}（30秒ごとに自動更新）
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense>
      <OrderStatusContent />
    </Suspense>
  );
}
