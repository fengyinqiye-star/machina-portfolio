"use client";

import { useState, useEffect, useCallback } from "react";

type Order = {
  orderId: string;
  projectName: string;
  contactEmail: string;
  contactName: string;
  createdAt: string;
  status: string;
  deployUrl: string;
};

const STATUS_COLORS: Record<string, string> = {
  "納品完了": "#a8e63a",
  "開発中": "#60a5fa",
  "支払い待ち": "#facc15",
  "受付済み": "#888",
  "エラー停止": "#f56042",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const loadOrders = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-password": pw },
      });
      if (res.status === 401) { setError("パスワードが間違っています"); setAuthed(false); setLoading(false); return; }
      if (!res.ok) { setError("取得に失敗しました"); setLoading(false); return; }
      const json = await res.json();
      setOrders(json.orders ?? []);
      setAuthed(true);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders(password);
  };

  // 定期更新
  useEffect(() => {
    if (!authed) return;
    const id = setInterval(() => loadOrders(password), 60000);
    return () => clearInterval(id);
  }, [authed, password, loadOrders]);

  const statuses = Array.from(new Set(orders.map((o) => o.status)));
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts = {
    total: orders.length,
    delivered: orders.filter((o) => o.status === "納品完了").length,
    inProgress: orders.filter((o) => o.status === "開発中" || o.status === "受付済み").length,
    waiting: orders.filter((o) => o.status === "支払い待ち").length,
    error: orders.filter((o) => o.status === "エラー停止").length,
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#e8e5df] flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <p className="text-[#a8e63a] text-xs tracking-[0.25em] uppercase font-mono mb-8">Machina / Admin</p>
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

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#e8e5df]">
      <div className="fixed top-0 left-0 right-0 h-px bg-[#a8e63a]" />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[#a8e63a] text-xs tracking-[0.25em] uppercase font-mono mb-2">Machina / Admin</p>
            <h1 className="text-2xl font-bold">案件ダッシュボード</h1>
          </div>
          <button
            onClick={() => loadOrders(password)}
            className="text-xs font-mono text-[#555250] hover:text-[#a8e63a] transition-colors border border-[#1E1E1C] px-3 py-1.5"
          >
            更新
          </button>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-[#1E1E1C] mb-8">
          {[
            { label: "総案件数", value: counts.total, color: "#e8e5df" },
            { label: "納品完了", value: counts.delivered, color: "#a8e63a" },
            { label: "進行中", value: counts.inProgress, color: "#60a5fa" },
            { label: "支払い待ち", value: counts.waiting, color: "#facc15" },
            { label: "エラー", value: counts.error, color: "#f56042" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0D0D0D] p-4">
              <p className="text-xs text-[#555250] font-mono mb-1">{s.label}</p>
              <p className="text-3xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* フィルター */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFilter("all")}
            className="text-xs font-mono px-3 py-1 border transition-colors"
            style={{ borderColor: filter === "all" ? "#a8e63a" : "#333", color: filter === "all" ? "#a8e63a" : "#555250" }}
          >
            すべて ({orders.length})
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="text-xs font-mono px-3 py-1 border transition-colors"
              style={{
                borderColor: filter === s ? (STATUS_COLORS[s] ?? "#555") : "#333",
                color: filter === s ? (STATUS_COLORS[s] ?? "#e8e5df") : "#555250",
              }}
            >
              {s} ({orders.filter((o) => o.status === s).length})
            </button>
          ))}
        </div>

        {/* テーブル */}
        <div className="divide-y divide-[#1E1E1C]">
          {filtered.length === 0 && (
            <p className="text-[#555250] font-mono text-sm py-8 text-center">案件がありません</p>
          )}
          {filtered.map((order) => (
            <div key={order.orderId} className="py-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 hover:bg-[#111] transition-colors px-2 -mx-2">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 border shrink-0"
                    style={{ color: STATUS_COLORS[order.status] ?? "#888", borderColor: STATUS_COLORS[order.status] ?? "#333" }}
                  >
                    {order.status}
                  </span>
                  <p className="text-sm font-medium text-[#e8e5df] truncate">{order.projectName}</p>
                </div>
                <p className="font-mono text-xs text-[#555250] mb-1">{order.orderId}</p>
                <p className="text-xs text-[#444440]">
                  {order.contactName && `${order.contactName} · `}
                  {order.contactEmail}
                  {order.createdAt && ` · ${new Date(order.createdAt).toLocaleDateString("ja-JP")}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {order.deployUrl && (
                  <a
                    href={order.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#a8e63a] hover:underline"
                  >
                    サイト →
                  </a>
                )}
                <a
                  href={`/status/${order.orderId}`}
                  className="text-xs font-mono text-[#555250] hover:text-[#e8e5df] border border-[#1E1E1C] px-2 py-1 transition-colors"
                >
                  詳細
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
