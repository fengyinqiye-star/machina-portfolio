"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

type Question = { key: string; label: string; placeholder: string };

function HearingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const projectName = searchParams.get("name") ?? "ご依頼の案件";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [round, setRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/hearing-questions/${orderId}`)
      .then(r => r.json())
      .then(data => {
        if (data.ready && data.questions.length > 0) {
          setQuestions(data.questions);
          setRound(data.round);
        } else {
          // 質問未生成の場合はフォールバック
          setQuestions([
            { key: "overview", label: "ご要望の詳細を教えてください", placeholder: "具体的な内容、こだわりたい点など" },
            { key: "design", label: "デザインのイメージや参考サイトがあれば教えてください", placeholder: "例：シンプルでナチュラルな雰囲気、参考URL: https://..." },
            { key: "content", label: "掲載したいコンテンツや機能を教えてください", placeholder: "例：メニュー一覧・写真・お問い合わせフォームなど" },
            { key: "deadline", label: "ご希望の納期はありますか？", placeholder: "例：2週間以内、来月中など" },
            { key: "other", label: "その他ご要望があれば", placeholder: "予算感・特に重視したい点など" },
          ]);
        }
        setLoading(false);
      })
      .catch(() => { setLoadError(true); setLoading(false); });
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/hearing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, answers, round }),
      });
      const json = await res.json();
      if (json.success) setSubmitted(true);
      else setError("送信に失敗しました。再度お試しください。");
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h1 style={styles.title}>ご回答ありがとうございます</h1>
          <p style={styles.muted}>
            内容を確認し、追加でお聞きすることがあれば改めてご連絡します。<br />
            ヒアリング完了後、お見積もりとお支払いリンクをメールでお送りします。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ ...styles.muted, fontSize: 12, letterSpacing: "0.1em", marginBottom: 8 }}>
            MACHINA — HEARING {round > 1 ? `(第${round}回)` : ""}
          </p>
          <h1 style={styles.title}>詳細ヒアリング</h1>
          <p style={{ ...styles.muted, marginBottom: 4 }}>案件: <strong style={{ color: "#e8e5df" }}>{projectName}</strong></p>
          <p style={styles.muted}>
            {round > 1
              ? `前回のご回答を確認しました。追加でいくつか確認させてください。`
              : `開発をより正確に進めるため、いくつかお聞きします。`}
          </p>
        </div>

        {loading ? (
          <p style={styles.muted}>質問を読み込み中...</p>
        ) : loadError ? (
          <div>
            <p style={{ color: "#f56042", fontSize: 14, marginBottom: 16 }}>
              質問の読み込みに失敗しました。ページを再読み込みしてください。
            </p>
            <button onClick={() => window.location.reload()} style={{ ...styles.button, background: "#333", color: "#e8e5df" }}>
              再読み込み
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {questions.map(q => (
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
            <button type="submit" disabled={submitting} style={styles.button}>
              {submitting ? "送信中..." : "回答を送信する"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function HearingPage() {
  return (
    <Suspense>
      <HearingContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { background: "#0f0f0e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "sans-serif" },
  card: { background: "#1a1a18", border: "1px solid #2a2a28", borderRadius: 12, padding: "40px 48px", maxWidth: 640, width: "100%" },
  title: { color: "#e8e5df", fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  muted: { color: "#88857f", fontSize: 14, lineHeight: 1.7, margin: 0 },
  label: { display: "block", color: "#e8e5df", fontSize: 14, fontWeight: "bold", marginBottom: 8 },
  textarea: { width: "100%", background: "#0f0f0e", border: "1px solid #2a2a28", borderRadius: 6, color: "#e8e5df", fontSize: 14, padding: "12px 16px", resize: "vertical", fontFamily: "sans-serif", lineHeight: 1.6, boxSizing: "border-box" },
  button: { width: "100%", background: "#a8e63a", color: "#111", border: "none", borderRadius: 6, padding: "14px", fontSize: 15, fontWeight: "bold", cursor: "pointer" },
};
