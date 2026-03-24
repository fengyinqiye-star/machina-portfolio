"use client";

import { useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

function FeedbackContent() {
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
  const [upgradeUrl, setUpgradeUrl] = useState("");

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
      } else if (res.status === 429 && json.upgradeUrl) {
        setError(`${json.error} → `);
        setUpgradeUrl(json.upgradeUrl);
      } else {
        setError(json.error ?? "送信に失敗しました。再度お試しください。");
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
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <h1 style={styles.title}>修正依頼を受け付けました</h1>
          <p style={{ ...styles.muted, marginBottom: 24 }}>
            AIエージェントが内容を確認し、すぐに修正を開始します。<br />
            完了次第メールでご連絡します。
          </p>
          <div style={styles.infoBox}>
            <p style={{ ...styles.muted, fontSize: 13, margin: 0 }}>
              💡 <strong style={{ color: "#e8e5df" }}>修正は何度でも歓迎です。</strong><br />
              理想のサイトになるまで、遠慮なくご依頼ください。<br />
              修正完了後のメールに次回の修正フォームリンクが含まれています。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* ヘッダー */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ ...styles.muted, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            Machina — 修正依頼フォーム
          </p>
          <h1 style={styles.title}>
            理想に近づけましょう
          </h1>
          <p style={{ ...styles.muted, marginBottom: 16, lineHeight: 1.8 }}>
            修正依頼を受け取ったら、AIエージェントがすぐに対応を開始します。<br />
            <strong style={{ color: "#a8e63a" }}>何度でも遠慮なくご依頼ください。</strong>
          </p>
          <p style={{ ...styles.muted, fontSize: 13 }}>
            案件: <strong style={{ color: "#e8e5df" }}>{projectName}</strong>
            {revisionNo > 1 && <span style={{ marginLeft: 12, color: "#a8e63a", fontSize: 12 }}>修正 #{revisionNo}</span>}
          </p>
          {previewUrl && (
            <p style={{ ...styles.muted, fontSize: 13, marginTop: 4 }}>
              現在のサイト:{" "}
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#a8e63a" }}>
                確認する →
              </a>
            </p>
          )}
        </div>

        {/* 修正例ヒント */}
        <div style={styles.hintBox}>
          <p style={{ ...styles.muted, fontSize: 12, marginBottom: 8 }}>
            💬 こんな内容でも大丈夫です
          </p>
          <ul style={{ ...styles.muted, fontSize: 12, margin: 0, paddingLeft: 16, lineHeight: 2 }}>
            <li>「トップの写真をこのURLの画像に変えてほしい」</li>
            <li>「営業時間を 10:00〜20:00 に修正して」</li>
            <li>「全体的にもう少し高級感を出してほしい」</li>
            <li>「スマホで見たとき◯◯が崩れている」</li>
            <li>「予約フォームを追加したい」</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={styles.label}>
              修正してほしい点をご記入ください
              <span style={{ ...styles.muted, fontWeight: "normal", fontSize: 12, marginLeft: 8 }}>
                （複数ある場合はまとめてどうぞ）
              </span>
            </label>
            <textarea
              style={{ ...styles.textarea, minHeight: 200 }}
              placeholder={"例：\n・トップのキャッチコピーを「〇〇〇」に変更\n・ヘッダーの背景色をもう少し濃くしたい\n・お問い合わせフォームの送信先を xxx@gmail.com に変更\n・スマホでメニューが崩れているので直してほしい"}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: "#f56042", fontSize: 13, marginBottom: 16 }}>
              {error}
              {upgradeUrl && (
                <a href={upgradeUrl} style={{ color: "#a8e63a", marginLeft: 4 }}>プランを確認する →</a>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !feedback.trim()}
            style={{
              ...styles.button,
              opacity: !feedback.trim() ? 0.5 : 1,
              cursor: !feedback.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "送信中..." : "修正依頼を送信する →"}
          </button>

          <p style={{ ...styles.muted, fontSize: 12, textAlign: "center", marginTop: 16 }}>
            送信後、AIエージェントが自動で修正を開始します。通常数時間以内に完了します。
          </p>
        </form>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense>
      <FeedbackContent />
    </Suspense>
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
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    lineHeight: 1.3,
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
    transition: "opacity 0.2s",
  },
  hintBox: {
    background: "#111110",
    border: "1px solid #2a2a28",
    borderRadius: 8,
    padding: "16px 20px",
    marginBottom: 24,
  },
  infoBox: {
    background: "#111110",
    borderLeft: "3px solid #a8e63a",
    borderRadius: "0 8px 8px 0",
    padding: "16px 20px",
  },
};
