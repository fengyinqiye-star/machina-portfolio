"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";

export default function OwnerReviewPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const defaultAction = searchParams.get("action") as "approve" | "reject" | null;

  const [action, setAction] = useState<"approve" | "reject" | null>(defaultAction);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (defaultAction) setAction(defaultAction);
  }, [defaultAction]);

  const handleSubmit = async () => {
    if (!action) return;
    setStatus("submitting");
    try {
      const res = await fetch(`/api/owner-approval/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action, note: note.trim() || undefined }),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "エラーが発生しました");
        setStatus("error");
      }
    } catch {
      setErrorMsg("通信エラーが発生しました");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ fontSize: 48, textAlign: "center" }}>
            {action === "approve" ? "✅" : "🔁"}
          </p>
          <h1 style={styles.title}>
            {action === "approve" ? "承認しました" : "差し戻しました"}
          </h1>
          <p style={styles.body}>
            {action === "approve"
              ? "お客様への納品処理を開始します。完了次第、納品メールが自動送信されます。"
              : "差し戻し内容をもとに修正を開始します。修正完了後、再度レビュー依頼メールをお送りします。"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>オーナーレビュー</h1>
        <p style={styles.meta}>ORDER: {orderId}</p>

        <p style={styles.body}>
          開発・QA・コードレビューが完了しました。<br />
          お客様への納品前に内容をご確認ください。
        </p>

        <div style={styles.actionRow}>
          <button
            onClick={() => setAction("approve")}
            style={{
              ...styles.btn,
              background: action === "approve" ? "#16a34a" : "#f0fdf4",
              color: action === "approve" ? "#fff" : "#16a34a",
              border: "2px solid #16a34a",
            }}
          >
            ✅ 承認して納品する
          </button>
          <button
            onClick={() => setAction("reject")}
            style={{
              ...styles.btn,
              background: action === "reject" ? "#dc2626" : "#fff5f5",
              color: action === "reject" ? "#fff" : "#dc2626",
              border: "2px solid #dc2626",
            }}
          >
            🔁 差し戻す
          </button>
        </div>

        {action === "reject" && (
          <div style={{ marginTop: 20 }}>
            <label style={styles.label}>差し戻し理由・修正内容（任意）</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder="例: ヒーロー画像をもっと大きくしてほしい / 料金表のフォントサイズを大きく"
              style={styles.textarea}
            />
          </div>
        )}

        {status === "error" && (
          <p style={{ color: "#dc2626", marginTop: 12, fontSize: 14 }}>{errorMsg}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!action || status === "submitting"}
          style={{
            ...styles.submitBtn,
            opacity: !action || status === "submitting" ? 0.5 : 1,
            cursor: !action || status === "submitting" ? "not-allowed" : "pointer",
          }}
        >
          {status === "submitting" ? "送信中..." : "確定する"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "#fafaf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 40,
    maxWidth: 560,
    width: "100%",
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#111",
  },
  meta: {
    fontSize: 12,
    color: "#888",
    marginBottom: 20,
  },
  body: {
    fontSize: 15,
    color: "#444",
    lineHeight: 1.7,
    marginBottom: 24,
  },
  actionRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  btn: {
    padding: "12px 20px",
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.15s",
    flex: 1,
    minWidth: 160,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 8,
  },
  textarea: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #e0ddd8",
    fontSize: 14,
    lineHeight: 1.6,
    resize: "vertical",
    boxSizing: "border-box",
  },
  submitBtn: {
    display: "block",
    width: "100%",
    marginTop: 24,
    padding: "14px 0",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
};
