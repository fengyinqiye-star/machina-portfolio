"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function AcceptancePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const projectName = searchParams.get("name") ?? "納品物";
  const deployUrl = searchParams.get("url") ?? "";

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/acceptance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, rating: rating || undefined, comment: comment || undefined }),
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
      <div className="min-h-screen bg-[#0D0D0D] text-[#e8e5df] flex items-center justify-center px-6">
        <div className="max-w-lg w-full">
          <p className="text-[#a8e63a] text-xs tracking-[0.25em] uppercase font-mono mb-6">Machina</p>
          <h1 className="text-4xl font-bold mb-6">検収完了</h1>
          <p className="text-[#88857f] mb-8">
            ご確認いただきありがとうございます。<br />
            プロジェクトが正式にクローズされました。
          </p>
          <p className="text-sm text-[#555250] font-mono">{orderId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#e8e5df]">
      <div className="fixed top-0 left-0 right-0 h-px bg-[#a8e63a] z-50" />

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-16">
        <p className="text-[#a8e63a] text-xs tracking-[0.25em] uppercase font-mono mb-12">Machina</p>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-none mb-4">
          納品物の検収
        </h1>
        <p className="text-[#88857f] mb-12">
          開発が完了しました。納品物をご確認の上、問題がなければ検収をお願いします。
        </p>

        <div className="border-t border-[#1E1E1C] py-6 mb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-[#555250] font-mono mb-4">Project</p>
          <h2 className="text-xl font-bold mb-2">{projectName}</h2>
          <p className="font-mono text-xs text-[#555250] mb-4">{orderId}</p>
          {deployUrl && (
            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-mono text-sm text-[#a8e63a] hover:underline break-all"
            >
              {deployUrl} →
            </a>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-[#555250] font-mono mb-4">
              満足度（任意）
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-3xl transition-colors"
                  style={{ color: star <= (hovered || rating) ? "#a8e63a" : "#2a2a28" }}
                  aria-label={`${star}点`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-[#555250] font-mono mb-3">
              コメント（任意）
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="ご感想・ご意見をお聞かせください"
              className="w-full bg-[#080808] border border-[#1E1E1C] text-[#e8e5df] px-4 py-3 font-mono text-sm resize-none focus:outline-none focus:border-[#a8e63a] placeholder-[#2a2a28]"
            />
          </div>

          {error && (
            <p className="text-[#f56042] font-mono text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 bg-[#a8e63a] text-[#0D0D0D] font-bold font-mono tracking-wide disabled:opacity-50 hover:bg-[#bdf048] transition-colors"
          >
            {loading ? "送信中..." : "検収を確認する"}
          </button>

          <p className="text-xs text-[#444440] font-mono">
            ※ 検収後30日間は重大な不具合の修正に無償対応します。
          </p>
        </form>
      </div>
    </div>
  );
}
