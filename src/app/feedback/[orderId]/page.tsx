"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function FeedbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const projectName = searchParams.get("name") ?? "納品物";
  const previewUrl = searchParams.get("url") ?? "";
  const revisionNo = Number(searchParams.get("rev") ?? "1");

  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, feedback, revisionNo }),
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
          <h1 style={styles.title}>修正依頼を受け付けました</h1>
          <p style={styles.muted}>AIエージェントが修正を開始します。<br />完了後に改めてご連絡します。</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ ...styles.muted, fontSize: 12, letterSpacing: "0.1em", marginBottom: 8 }}>AI COMPANY — FEEDBACK</p>
          <h1 style={styles.title}>修正フィードバック</h1>
          <p style={{ ...styles.muted, marginBottom: 4 }}>案件: <strong style={{ color: "#e8e5df" }}>{projectName}</strong></p>
          {previewUrl && (
            <p style={styles.muted}>
              納品物を確認:{" "}
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#a8e63a" }}>
                {previewUrl}
              </a>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={styles.label}>修正してほしい点をすべてご記入ください</label>
            <p style={{ ...styles.muted, fontSize: 12, marginBottom: 8 }}>
              具体的に書いていただくほど正確に修正できます。<br />
              例：「トップページのメインビジュアルをこの写真（URL）に変えてほしい」「メニューの値段をラテ650円→700円に修正」
            </p>
            <textarea
              style={{ ...styles.textarea, minHeight: 200 }}
              placeholder={"・トップの写真をこのURLの画像に変更してほしい\n・営業時間を10:00〜20:00に修正\n・お問い合わせフォームの送信先をXXX@gmail.comに変更"}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: "#f56042", fontSize: 13, marginBottom: 16 }}>{error}</p>}
          <button type="submit" disabled={loading || !feedback.trim()} style={{
            ...styles.button,
            opacity: !feedback.trim() ? 0.5 : 1,
            cursor: !feedback.trim() ? "not-allowed" : "pointer",
          }}>
            {loading ? "送信中..." : "修正依頼を送信する"}
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
  },
};
