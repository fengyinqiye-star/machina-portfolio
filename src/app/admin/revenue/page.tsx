"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type MonthlyData = {
  month: string;
  revenue: number;
  orders: number;
  avgPrice: number;
};

type TotalData = {
  revenue: number;
  orders: number;
  avgPrice: number;
  revisionRate: number;
};

type RecentOrder = {
  orderId: string;
  projectName: string;
  amount: number;
  status: string;
  deliveredAt: string;
};

type RevenueData = {
  monthly: MonthlyData[];
  total: TotalData;
  recentOrders: RecentOrder[];
};

const STATUS_LABELS: Record<string, string> = {
  delivered: "納品完了",
  processing: "開発中",
  awaiting_payment: "支払い待ち",
  received: "受付済み",
  failed: "エラー停止",
};

const STATUS_COLORS: Record<string, string> = {
  delivered: "#a8e63a",
  processing: "#60a5fa",
  awaiting_payment: "#facc15",
  received: "#888",
  failed: "#f56042",
};

function fmt(n: number) {
  return "¥" + n.toLocaleString("ja-JP");
}

export default function RevenuePage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<RevenueData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/revenue", {
        headers: { "x-admin-password": pw },
      });
      if (res.status === 401) {
        setError("パスワードが間違っています");
        setAuthed(false);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("取得に失敗しました");
        setLoading(false);
        return;
      }
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

  useEffect(() => {
    if (!authed) return;
    const id = setInterval(() => loadData(password), 60000);
    return () => clearInterval(id);
  }, [authed, password, loadData]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#e8e5df] flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <p className="text-[#a8e63a] text-xs tracking-[0.25em] uppercase font-mono mb-8">
            Machina / Admin / Revenue
          </p>
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
            {error && (
              <p className="text-[#f56042] font-mono text-xs">{error}</p>
            )}
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

  const total = data?.total ?? { revenue: 0, orders: 0, avgPrice: 0, revisionRate: 0 };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#e8e5df]">
      <div className="fixed top-0 left-0 right-0 h-px bg-[#a8e63a]" />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[#a8e63a] text-xs tracking-[0.25em] uppercase font-mono mb-2">
              Machina / Admin
            </p>
            <h1 className="text-2xl font-bold">収益ダッシュボード</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs font-mono text-[#555250] hover:text-[#a8e63a] transition-colors border border-[#1E1E1C] px-3 py-1.5"
            >
              ← 案件一覧
            </Link>
            <button
              onClick={() => loadData(password)}
              className="text-xs font-mono text-[#555250] hover:text-[#a8e63a] transition-colors border border-[#1E1E1C] px-3 py-1.5"
            >
              更新
            </button>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1E1E1C] mb-8">
          {[
            { label: "総売上", value: fmt(total.revenue), color: "#a8e63a" },
            { label: "総案件数", value: `${total.orders} 件`, color: "#e8e5df" },
            { label: "平均単価", value: fmt(total.avgPrice), color: "#60a5fa" },
            {
              label: "修正発生率",
              value: `${Math.round(total.revisionRate * 100)}%`,
              color: "#facc15",
            },
          ].map((s) => (
            <div key={s.label} className="bg-[#0D0D0D] p-5">
              <p className="text-xs text-[#555250] font-mono mb-2">{s.label}</p>
              <p
                className="text-2xl font-bold tabular-nums"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* 月次推移テーブル */}
        <div className="mb-8">
          <h2 className="text-sm font-mono text-[#555250] uppercase tracking-widest mb-4">
            月次推移
          </h2>
          {data && data.monthly.length > 0 ? (
            <div className="border border-[#1E1E1C]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1E1E1C] bg-[#080808]">
                    <th className="text-left px-4 py-3 font-mono text-xs text-[#555250] font-normal">
                      月
                    </th>
                    <th className="text-right px-4 py-3 font-mono text-xs text-[#555250] font-normal">
                      売上
                    </th>
                    <th className="text-right px-4 py-3 font-mono text-xs text-[#555250] font-normal">
                      案件数
                    </th>
                    <th className="text-right px-4 py-3 font-mono text-xs text-[#555250] font-normal">
                      平均単価
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E1E1C]">
                  {data.monthly.map((row) => (
                    <tr key={row.month} className="hover:bg-[#111] transition-colors">
                      <td className="px-4 py-3 font-mono text-[#e8e5df]">
                        {row.month}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[#a8e63a] tabular-nums">
                        {fmt(row.revenue)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[#e8e5df] tabular-nums">
                        {row.orders}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[#60a5fa] tabular-nums">
                        {fmt(row.avgPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#555250] font-mono text-sm py-8 text-center border border-[#1E1E1C]">
              データがありません
            </p>
          )}
        </div>

        {/* 最近の案件一覧 */}
        <div>
          <h2 className="text-sm font-mono text-[#555250] uppercase tracking-widest mb-4">
            最近の案件（直近10件）
          </h2>
          {data && data.recentOrders.length > 0 ? (
            <div className="divide-y divide-[#1E1E1C] border border-[#1E1E1C]">
              {data.recentOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="px-4 py-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 hover:bg-[#111] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                      <span
                        className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 border shrink-0"
                        style={{
                          color: STATUS_COLORS[order.status] ?? "#888",
                          borderColor: STATUS_COLORS[order.status] ?? "#333",
                        }}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                      <p className="text-sm font-medium text-[#e8e5df] truncate">
                        {order.projectName}
                      </p>
                    </div>
                    <p className="font-mono text-xs text-[#555250]">
                      {order.orderId}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <p className="font-mono text-sm tabular-nums text-[#a8e63a]">
                      {fmt(order.amount)}
                    </p>
                    {order.deliveredAt && (
                      <p className="font-mono text-xs text-[#444440]">
                        {order.deliveredAt}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#555250] font-mono text-sm py-8 text-center border border-[#1E1E1C]">
              案件がありません
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
