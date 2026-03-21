import Link from "next/link";
import { Button } from "@/components/atoms/Button";

export default function ThanksPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-6">
      <div className="text-center max-w-lg">
        <div
          className="inline-flex items-center justify-center w-16 h-16 border mb-8"
          style={{ borderColor: "var(--accent)" }}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: "var(--accent)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
          Received
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
          受付完了しました
        </h1>
        <p className="text-[var(--muted)] mb-2 leading-relaxed">
          案件のご依頼ありがとうございます。
        </p>
        <p className="text-[var(--muted)] mb-10 leading-relaxed">
          AIオーケストレーターが内容を分析し、
          担当エージェントチームが順次対応を開始します。
          ご入力いただいたメールアドレスへご連絡いたします。
        </p>
        <Link href="/">
          <Button variant="primary">トップページへ戻る</Button>
        </Link>
      </div>
    </main>
  );
}
