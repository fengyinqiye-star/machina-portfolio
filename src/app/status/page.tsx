"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = { label: string; done: boolean; active?: boolean; detail?: string };

type Order = {
  id: string;
  projectName: string;
  contactName: string;
  status: "completed" | "processing" | "failed" | "pending";
  step: string;
  steps: Step[];
  elapsedSec: number | null;
};

type StatusData = {
  orders: Order[];
  logs: string[];
  updatedAt: string;
};

const STATUS_CONFIG = {
  completed: { label: "納品完了", accent: "#a8e63a" },
  processing: { label: "開発中",   accent: "#F59E0B" },
  failed:     { label: "失敗",     accent: "#f56042" },
  pending:    { label: "待機中",   accent: "#555250" },
};

function formatElapsed(sec: number): string {
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
}

function StepPipeline({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center gap-0 mt-4 flex-wrap">
      {steps.map((s, i) => {
        const done   = s.done;
        const active = !done && s.active;
        return (
          <div key={i} className="flex items-center">
            <span className={`text-[11px] px-2 py-0.5 font-mono tracking-wide ${
              done    ? "text-[#a8e63a]" :
              active  ? "text-[#F59E0B] animate-pulse" :
                        "text-[#444440]"
            }`}>
              {done ? "✓" : active ? "⚙" : "○"} {s.label}
              {s.detail && <span className="text-[#444440] ml-1">({s.detail})</span>}
            </span>
            {i < steps.length - 1 && (
              <span className={`text-[10px] mx-0.5 ${done ? "text-[#a8e63a]" : "text-[#2a2a28]"}`}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const listVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function StatusPage() {
  const [data, setData]           = useState<StatusData | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [pulse, setPulse]         = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
    try {
      const res  = await fetch("/api/status");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString("ja-JP"));
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
      // ログを末尾にスクロール
      requestAnimationFrame(() => {
        if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
      });
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchStatus();
    const iv = setInterval(fetchStatus, 10000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#e8e5df] font-[var(--font-space)]">
      {/* アクセントライン */}
      <div className="fixed top-0 left-0 right-0 h-px bg-[#F59E0B] z-50" />

      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-16">

        {/* ヘッダー — 1コンポジション */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-[#F59E0B] text-xs tracking-[0.25em] uppercase mb-3 font-mono">Machina</p>
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-none">
              案件ステータス
            </h1>
            <motion.span
              animate={{ opacity: pulse ? 1 : 0.4 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-xs text-[#555250]"
            >
              {lastUpdated ? `${lastUpdated} · 10秒ごと更新` : "読込中…"}
            </motion.span>
          </div>
          <div className="mt-4 h-px bg-[#1E1E1C]" />
        </motion.div>

        {/* 案件リスト — カードなし、区切り線 */}
        <section className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-[#555250] font-mono mb-6">Orders</p>

          {!data ? (
            <p className="text-[#555250] font-mono text-sm">読み込み中…</p>
          ) : data.orders.length === 0 ? (
            <p className="text-[#555250] font-mono text-sm">案件なし</p>
          ) : (
            <motion.ul
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-[#1E1E1C]"
            >
              <AnimatePresence>
                {data.orders.map(order => {
                  const cfg = STATUS_CONFIG[order.status];
                  return (
                    <motion.li
                      key={order.id}
                      variants={itemVariants}
                      layout
                      className="py-6"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0">
                          <h2 className="font-bold text-base sm:text-lg leading-tight mb-1 truncate">
                            {order.projectName}
                          </h2>
                          <p className="font-mono text-xs text-[#555250] truncate">
                            {order.id}
                            <span className="mx-2 text-[#2a2a28]">·</span>
                            {order.contactName}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className="font-mono text-xs font-semibold tracking-wide"
                            style={{ color: cfg.accent }}
                          >
                            {order.status === "processing" && (
                              <span className="inline-block mr-1 animate-spin">⚙</span>
                            )}
                            {cfg.label}
                          </span>
                          {order.elapsedSec !== null && (
                            <p className="font-mono text-[10px] text-[#444440] mt-0.5">
                              {formatElapsed(order.elapsedSec)} 経過
                            </p>
                          )}
                        </div>
                      </div>
                      {order.steps && <StepPipeline steps={order.steps} />}
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          )}
        </section>

        {/* ログ */}
        <section>
          <p className="text-xs tracking-[0.2em] uppercase text-[#555250] font-mono mb-4">Recent Logs</p>
          <div
            ref={logsRef}
            className="bg-[#080808] border border-[#1E1E1C] p-4 max-h-80 overflow-y-auto"
          >
            {!data || data.logs.length === 0 ? (
              <p className="text-[#444440] font-mono text-xs">ログなし</p>
            ) : (
              data.logs.map((line, i) => {
                const color =
                  line.includes("ERROR") || line.includes("失敗") || line.includes("エラー") ? "#f56042"
                  : line.includes("完了") || line.includes("✅") || line.includes("SUCCESS") ? "#a8e63a"
                  : line.includes("処理中") || line.includes("🔄") || line.includes("💳") ? "#F59E0B"
                  : "#444440";
                return (
                  <div
                    key={i}
                    className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all"
                    style={{ color }}
                  >
                    {line}
                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
