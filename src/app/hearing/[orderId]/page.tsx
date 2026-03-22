"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const QUESTIONS = [
  { key: "purpose", label: "サイト・アプリの目的・用途を教えてください", placeholder: "例：カフェの集客、商品の販売、会社の紹介など" },
  { key: "target", label: "主なターゲットユーザーは誰ですか？", placeholder: "例：20〜30代の女性、近隣住民、法人の担当者など" },
  { key: "content", label: "掲載したいコンテンツや機能を具体的に教えてください", placeholder: "例：メニュー一覧・値段・営業時間・アクセス・予約フォームなど" },
  { key: "design", label: "デザインのイメージ・参考サイトがあれば教えてください", placeholder: "例：シンプルでナチュラルな雰囲気、参考URL: https://..." },
  { key: "assets", label: "使用したい写真・ロゴ・テキスト素材はありますか？", placeholder: "例：写真はこちらで用意する、ロゴのURLは https://...、テキストは後日送ります など" },
  { key: "deadline", label: "ご希望の納期はありますか？", placeholder: "例：2週間以内、来月中、急ぎではないなど" },
  { key: "other", label: "その他、ご要望・ご質問があればご記入ください", placeholder: "例：予算感、特に重視したい点など" },
];

export default function HearingPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hearing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, answers }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
      } else {
        setError("送信に失敗しました。再度お試しください。");
      }
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h1 style={styles.title}>ご回答ありがとうございます</h1>
          <p style={styles.muted}>内容を確認次第、開発を開始します。<br />完了後にメールでご連絡します。</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ ...styles.muted, fontSize: 12, letterSpacing: "0.1em", marginBottom: 8 }}>AI COMPANY — HEARING</p>
          <h1 style={styles.title}>詳細ヒアリング</h1>
          <p style={styles.muted}>ご依頼の内容をより正確に把握するため、以下の項目にご回答ください。AIエージェントが内容を確認後、開発を開始します。</p>
        </div>
        <form onSubmit={handleSubmit}>
          {QUESTIONS.map(q => (
            <div key={q.key} style={{ marginBottom: 24 }}>
              <label style={styles.label}>{q.label}</label>
              <textarea
                style={styles.textarea}
                placeholder={q.placeholder}
                value={answers[q.key] ?? ""}
                onChange={e => setAnswers(prev => ({ ...prev, [q.key]: e.target.value }))}
                rows={3}
              />
            </div>
          ))}
          {error && <p style={{ color: "#f56042", fontSize: 13, marginBottom: 16 }}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "送信中..." : "回答を送信する"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "#0f0f0e",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    fontFamily: "sans-serif",
  },
  card: {
    background: "#1a1a18",
    border: "1px solid #2a2a28",
    borderRadius: 12,
    padding: "40px 48px",
    maxWidth: 640,
    width: "100%",
  },
  title: {
    color: "#e8e5df",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  muted: {
    color: "#88857f",
    fontSize: 14,
    lineHeight: 1.7,
    margin: 0,
  },
  label: {
    display: "block",
    color: "#e8e5df",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  textarea: {
    width: "100%",
    background: "#0f0f0e",
    border: "1px solid #2a2a28",
    borderRadius: 6,
    color: "#e8e5df",
    fontSize: 14,
    padding: "12px 16px",
    resize: "vertical",
    fontFamily: "sans-serif",
    lineHeight: 1.6,
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    background: "#a8e63a",
    color: "#111",
    border: "none",
    borderRadius: 6,
    padding: "14px",
    fontSize: 15,
    fontWeight: "bold",
    cursor: "pointer",
  },
};
