import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-6">
      <div className="text-center max-w-md">
        <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
          404
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
          ページが見つかりません
        </h1>
        <p className="text-[var(--muted)] mb-10 leading-relaxed">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block font-bold py-3 px-8 text-sm"
          style={{ background: "var(--accent)", color: "#111", borderRadius: 6 }}
        >
          トップページへ戻る
        </Link>
      </div>
    </main>
  );
}
