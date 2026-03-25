"use client";

import { useState } from "react";
import Link from "next/link";
import { NavBar } from "@/components/molecules/NavBar";

type Order = {
  orderId: string;
  projectName: string;
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

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "エラーが発生しました"); setLoading(false); return; }
      setOrders(json.orders ?? []);
      setSubmitted(true);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[var(--bg)] py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs tracking-widest uppercase mb-4 font-mono" style={{ color: "var(--accent)" }}>
            Dashboard
          </p>
          <h1 className="text-4xl font-bold text-[var(--text)] mb-4">案件ダッシュボード</h1>
          <p className="text-[var(--muted)] mb-10">
            ご依頼時に使用したメールアドレスを入力すると、案件一覧を確認できます。
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.com"
                required
                className="w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] placeholder-[var(--muted)]"
              />
              {error && <p className="text-[#f56042] font-mono text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full sm:w-auto px-8 py-3 text-sm font-bold disabled:opacity-50 transition-colors"
                style={{ background: "var(--accent)", color: "#111" }}
              >
                {loading ? "検索中..." : "案件を確認する →"}
              </button>
            </form>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[var(--muted)]">
                  <span className="font-mono text-[var(--text)]">{email}</span> の案件
                </p>
                <button
                  onClick={() => { setSubmitted(false); setOrders(null); setEmail(""); }}
                  className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors underline"
                >
                  別のメールで確認
                </button>
              </div>

              {orders && orders.length === 0 ? (
                <div className="py-12 text-center border border-[var(--border)]">
                  <p className="text-[var(--muted)] mb-4">このメールアドレスの案件が見つかりませんでした。</p>
                  <Link
                    href="/#contact"
                    className="text-sm font-semibold underline underline-offset-4"
                    style={{ color: "var(--accent)" }}
                  >
                    新規依頼はこちら →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {(orders ?? []).map((order) => (
                    <div key={order.orderId} className="py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span
                              className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 border shrink-0"
                              style={{ color: STATUS_COLORS[order.status] ?? "#888", borderColor: STATUS_COLORS[order.status] ?? "#333" }}
                            >
                              {order.status}
                            </span>
                            <p className="text-sm font-medium text-[var(--text)] truncate">{order.projectName}</p>
                          </div>
                          <p className="font-mono text-xs text-[var(--muted)]">{order.orderId}</p>
                          {order.createdAt && (
                            <p className="text-xs text-[var(--muted)] mt-0.5">
                              受付: {new Date(order.createdAt).toLocaleDateString("ja-JP")}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Link
                            href={`/status/${order.orderId}`}
                            className="text-xs font-mono border border-[var(--border)] px-3 py-1.5 text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--muted)] transition-colors"
                          >
                            詳細を見る →
                          </Link>
                          {order.deployUrl && (
                            <a
                              href={order.deployUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono"
                              style={{ color: "var(--accent)" }}
                            >
                              サイトを開く →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <footer className="py-10 text-center text-xs text-[var(--muted)] border-t border-[var(--border)]">
        <p>© 2026 Machina. All rights reserved.</p>
      </footer>
    </>
  );
}
