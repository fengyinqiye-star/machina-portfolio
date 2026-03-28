"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type AnalyticsData = {
  monthlyOrders: { month: string; count: number }[];
  funnel: { total: number; heard: number; paid: number; specd: number; delivered: number };
  avgDeliveryDays: number | null;
  revisionRate: number;
  topStatuses: { status: string; count: number }[];
};

const STATUS_COLORS: Record<string, string> = {
  "納品完了": "#a8e63a",
  "開発中": "#60a5fa",
  "支払い待ち": "#facc15",
  "受付済み": "#888",
  "エラー停止": "#f56042",
};

export default function AnalyticsPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/analytics", {
        headers: { "x-admin-password": pw },
      });
      if (res.status === 401) { setError("パスワードが間違っています"); setAuthed(false); setLoading(false); return; }
      if (res.status === 501) { setError("Vercel環境ではローカル集計のみ対応しています"); setLoading(false); return; }
      if (!res.ok) { setError("取得に失敗しました"); setLoading(false); return; }
      const json = await res.json();
      setData(json);
      setAuthed(true);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(password);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#e8e5df] flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <p className="text-[#a8e63a] text-xs tracking-[0.25em] uppercase font-mono mb-8">Machina / Analytics</p>
          <h1 className="text-3xl font-bold mb-8">管理者ログイン</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理者パスワード"
              autoFocus
              className="w-full bg-[#080808] border border-[#1E1E1C] text-[#e8e5df] px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#a8e63a] placeholder-[#333]"
            />
            {error && <p className="text-[#f56042] font-mono text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-[#a8e63a] text-[#0D0D0D] font-bold text-sm font-mono disabled:opacity-50 hover:bg-[#bdf048] transition-colors"
            >
              {loading ? "認証中..." : "ログイン"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const maxMonthly = data ? Math.max(...data.monthlyOrders.map((m) => m.count), 1) : 1;
  const funnelTotal = data?.funnel.total ?? 1;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#e8e5df]">
      <div className="fixed top-0 left-0 right-0 h-px bg-[#a8e63a]" />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[#a8e63a] text-xs tracking-[0.25em] uppercase font-mono mb-2">Machina / Analytics</p>
            <h1 className="text-2xl font-bold">運用ダッシュボード</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs font-mono text-[#555250] hover:text-[#a8e63a] transition-colors border border-[#1E1E1C] px-3 py-1.5">
              ← 案件一覧
            </Link>
            <button onClick={() => loadData(password)} className="text-xs font-mono text-[#555250] hover:text-[#a8e63a] transition-colors border border-[#1E1E1C] px-3 py-1.5">
              更新
            </button>
          </div>
        </div>

        {!data ? (
          <p className="text-[#555250] font-mono text-sm">{error || "読み込み中..."}</p>
        ) : (
          <div className="space-y-8">
            {/* KPI サマリー */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1E1E1C]">
              {[
                { label: "総案件数", value: data.funnel.total, unit: "件", color: "#e8e5df" },
                { label: "納品完了", value: data.funnel.delivered, unit: "件", color: "#a8e63a" },
                { label: "平均納品日数", value: data.avgDeliveryDays ?? "—", unit: data.avgDeliveryDays ? "日" : "", color: "#60a5fa" },
                { label: "修正依頼率", value: data.revisionRate, unit: "%", color: data.revisionRate > 30 ? "#f56042" : "#facc15" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-[#0D0D0D] p-5">
                  <p className="text-xs text-[#555250] font-mono mb-1">{kpi.label}</p>
                  <p className="text-3xl font-bold tabular-nums" style={{ color: kpi.color }}>
                    {kpi.value}<span className="text-sm ml-1 font-normal text-[#555250]">{kpi.unit}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 月別受注トレンド */}
              <div className="bg-[#080808] border border-[#1E1E1C] p-6">
                <h2 className="text-sm font-mono text-[#555250] uppercase tracking-widest mb-6">月別受注数（直近12ヶ月）</h2>
                <div className="flex items-end gap-1.5 h-32">
                  {data.monthlyOrders.map(({ month, count }) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-[#555250] tabular-nums">{count > 0 ? count : ""}</span>
                      <div
                        className="w-full transition-all"
                        style={{
                          height: `${Math.round((count / maxMonthly) * 100)}%`,
                          minHeight: count > 0 ? "4px" : "2px",
                          background: count > 0 ? "#a8e63a" : "#1E1E1C",
                        }}
                      />
                      <span className="text-[8px] font-mono text-[#333] rotate-0 whitespace-nowrap">
                        {month.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* コンバージョンファネル */}
              <div className="bg-[#080808] border border-[#1E1E1C] p-6">
                <h2 className="text-sm font-mono text-[#555250] uppercase tracking-widest mb-6">コンバージョンファネル</h2>
                <div className="space-y-3">
                  {[
                    { label: "受付", value: data.funnel.total, pct: 100 },
                    { label: "ヒアリング完了", value: data.funnel.heard, pct: Math.round((data.funnel.heard / funnelTotal) * 100) },
                    { label: "支払い完了", value: data.funnel.paid, pct: Math.round((data.funnel.paid / funnelTotal) * 100) },
                    { label: "要件定義完了", value: data.funnel.specd, pct: Math.round((data.funnel.specd / funnelTotal) * 100) },
                    { label: "納品完了", value: data.funnel.delivered, pct: Math.round((data.funnel.delivered / funnelTotal) * 100) },
                  ].map((f) => (
                    <div key={f.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-[#555250]">
                        <span>{f.label}</span>
                        <span>{f.value}件 ({f.pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-[#1E1E1C]">
                        <div className="h-full bg-[#a8e63a] transition-all" style={{ width: `${f.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ステータス別内訳 */}
            <div className="bg-[#080808] border border-[#1E1E1C] p-6">
              <h2 className="text-sm font-mono text-[#555250] uppercase tracking-widest mb-6">ステータス別内訳</h2>
              <div className="flex flex-wrap gap-4">
                {data.topStatuses.map(({ status, count }) => (
                  <div key={status} className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: STATUS_COLORS[status] ?? "#888" }}
                    />
                    <span className="text-sm text-[#888]">{status}</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: STATUS_COLORS[status] ?? "#e8e5df" }}>{count}</span>
                  </div>
                ))}
              </div>
              {data.topStatuses.length > 0 && (
                <div className="mt-4 flex h-3 bg-[#1E1E1C] overflow-hidden rounded-full">
                  {data.topStatuses.map(({ status, count }) => (
                    <div
                      key={status}
                      style={{
                        width: `${Math.round((count / data.funnel.total) * 100)}%`,
                        background: STATUS_COLORS[status] ?? "#888",
                      }}
                      title={`${status}: ${count}件`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
