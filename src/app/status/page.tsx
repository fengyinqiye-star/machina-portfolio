"use client";

import { useEffect, useState } from "react";

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
  completed: { label: "納品完了", color: "#a8e63a", bg: "#1a2a00" },
  processing: { label: "開発中", color: "#f5c842", bg: "#2a2200" },
  failed: { label: "失敗", color: "#f56042", bg: "#2a0a00" },
  pending: { label: "待機中", color: "#88857f", bg: "#1a1a1a" },
};

function formatElapsed(sec: number): string {
  if (sec < 60) return `${sec}秒`;
  if (sec < 3600) return `${Math.floor(sec / 60)}分`;
  return `${Math.floor(sec / 3600)}時間${Math.floor((sec % 3600) / 60)}分`;
}

function StepBar({ steps }: { steps: Step[] }) {
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 12, flexWrap: "wrap" }}>
      {steps.map((s, i) => {
        const color = s.done ? "#a8e63a" : s.active ? "#f5c842" : "#3a3a38";
        const textColor = s.done ? "#a8e63a" : s.active ? "#f5c842" : "#55524d";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 11, color: textColor, background: s.active ? "#2a2200" : "transparent", border: `1px solid ${color}`, borderRadius: 3, padding: "2px 8px", whiteSpace: "nowrap" }}>
              {s.done ? "✓ " : s.active ? "⚙ " : ""}{s.label}
              {s.detail && <span style={{ color: "#88857f", marginLeft: 4 }}>({s.detail})</span>}
            </div>
            {i < steps.length - 1 && <span style={{ color: "#3a3a38", fontSize: 10 }}>→</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchStatus = async () => {
    const res = await fetch("/api/status");
    const json = await res.json();
    setData(json);
    setLastUpdated(new Date().toLocaleTimeString("ja-JP"));
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "#0f0f0e", minHeight: "100vh", padding: "40px 24px", fontFamily: "monospace, sans-serif", color: "#e8e5df" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: "bold", color: "#a8e63a" }}>Machina — 案件ステータス</h1>
          <span style={{ fontSize: 12, color: "#88857f" }}>最終更新: {lastUpdated} (10秒ごと自動更新)</span>
        </div>

        {/* 案件一覧 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 13, color: "#88857f", marginBottom: 16, letterSpacing: "0.1em" }}>ORDERS</h2>
          {!data ? (
            <p style={{ color: "#88857f" }}>読み込み中...</p>
          ) : data.orders.length === 0 ? (
            <p style={{ color: "#88857f" }}>案件なし</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {data.orders.map(order => {
                const cfg = STATUS_CONFIG[order.status];
                return (
                  <div key={order.id} style={{ background: "#1a1a18", border: `1px solid #2a2a28`, borderLeft: `3px solid ${cfg.color}`, borderRadius: 6, padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: "bold", marginBottom: 2 }}>{order.projectName}</div>
                        <div style={{ fontSize: 12, color: "#88857f" }}>{order.id} · {order.contactName}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                        <div style={{ display: "inline-block", background: cfg.bg, color: cfg.color, fontSize: 12, padding: "4px 10px", borderRadius: 4, fontWeight: "bold" }}>
                          {order.status === "processing" && <span style={{ marginRight: 6 }}>⚙</span>}
                          {cfg.label}
                        </div>
                        {order.elapsedSec !== null && (
                          <div style={{ fontSize: 11, color: "#88857f", marginTop: 4 }}>{formatElapsed(order.elapsedSec)} 経過</div>
                        )}
                      </div>
                    </div>
                    {order.steps && <StepBar steps={order.steps} />}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ログ */}
        <section>
          <h2 style={{ fontSize: 13, color: "#88857f", marginBottom: 16, letterSpacing: "0.1em" }}>RECENT LOGS</h2>
          <div style={{ background: "#0a0a09", border: "1px solid #2a2a28", borderRadius: 6, padding: 16, maxHeight: 400, overflowY: "auto" }}>
            {!data || data.logs.length === 0 ? (
              <p style={{ color: "#88857f", fontSize: 12 }}>ログなし</p>
            ) : (
              data.logs.map((line, i) => {
                const color = line.includes("ERROR") || line.includes("失敗") ? "#f56042"
                  : line.includes("SUCCESS") || line.includes("完了") || line.includes("✅") ? "#a8e63a"
                  : line.includes("🔄") || line.includes("処理中") ? "#f5c842"
                  : "#88857f";
                return (
                  <div key={i} style={{ fontSize: 11, color, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
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
