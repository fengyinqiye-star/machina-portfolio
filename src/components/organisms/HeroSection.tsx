import Link from "next/link";
import { PROJECTS } from "@/data/projects";

export function HeroSection() {
  const projectCount = PROJECTS.length;
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center px-6 overflow-hidden bg-[var(--bg)]">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.5,
        }}
      />

      {/* Accent glow */}
      <div
        className="absolute top-1/4 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
          opacity: 0.06,
          filter: "blur(40px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto w-full py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--border)] text-[var(--muted)] text-xs tracking-widest uppercase mb-12">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: "var(--accent)" }}
          />
          フォームを送信するだけ — あとはAIが全部やる
        </div>

        {/* Main heading */}
        <h1 className="text-6xl md:text-8xl lg:text-[8rem] font-bold leading-[1.0] tracking-tight text-[var(--text)] mb-8">
          依頼から
          <br />
          <span style={{ color: "var(--accent)" }}>納品まで全自動。</span>
        </h1>

        <p className="text-base md:text-lg text-[var(--muted)] max-w-xl mb-6 leading-relaxed">
          要件定義・設計・実装・テスト・デプロイ——
          <br />
          16のAIエージェントが受注から納品まで全自動で動きます。
          <br />
          <span className="text-sm" style={{ color: "var(--accent)" }}>LP 1万円〜、コーポレート 3万円〜。従来の制作会社より圧倒的に安く、早い。</span>
        </p>

        {/* Social proof */}
        <p className="text-sm text-[var(--muted)] mb-10">
          <span style={{ color: "var(--accent)" }} className="font-bold">実績{projectCount}件・問い合わせ平均+190%</span>
          　|　検収後30日間の瑕疵担保付き
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--accent)" }}
          >
            無料で依頼する
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:border-[var(--muted)] transition-colors"
          >
            実績を見る
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-24 pt-8 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <div className="text-3xl font-bold tabular-nums text-[var(--text)]">2〜5日</div>
            <div className="text-xs text-[var(--muted)] mt-1 tracking-wide">LP平均納品日数</div>
          </div>
          <div>
            <div className="text-3xl font-bold tabular-nums text-[var(--text)]">24h/365日</div>
            <div className="text-xs text-[var(--muted)] mt-1 tracking-wide">AIが自動稼働</div>
          </div>
          <div>
            <div className="text-3xl font-bold tabular-nums" style={{ color: "var(--accent)" }}>
              90+
            </div>
            <div className="text-xs text-[var(--muted)] mt-1 tracking-wide">Lighthouse全項目保証</div>
          </div>
          <div>
            <div className="text-3xl font-bold tabular-nums" style={{ color: "var(--accent)" }}>
              ¥0
            </div>
            <div className="text-xs text-[var(--muted)] mt-1 tracking-wide">相談・見積もり</div>
          </div>
        </div>
      </div>

      {/* Bottom border accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ backgroundColor: "var(--border)" }} />
    </section>
  );
}
