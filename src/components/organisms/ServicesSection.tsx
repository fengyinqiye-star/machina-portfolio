const WORKFLOW_STEPS = [
  { num: "01", label: "受注", desc: "フォームから案件依頼を受付" },
  { num: "02", label: "要件定義", desc: "PMエージェントが要件を整理" },
  { num: "03", label: "設計", desc: "Architectが設計書を作成" },
  { num: "04", label: "実装", desc: "FE/BE/Infraを並列実装" },
  { num: "05", label: "テスト", desc: "QAエージェントが品質検証" },
  { num: "06", label: "レビュー", desc: "セキュリティ・品質チェック" },
  { num: "07", label: "納品", desc: "Vercelデプロイ可能な状態で納品" },
];

const FEATURED_WORKS = [
  {
    label: "歯科クリニック",
    title: "なかむら歯科クリニック",
    desc: "WEB予約・FAQ・Googleマップ連携を備えた公式サイト",
    tags: ["LP / コーポレート", "フォーム対応"],
    url: "https://ai-company-2026-03-23t00-00-03-kvbpp6sgn.vercel.app",
  },
  {
    label: "不動産会社",
    title: "タカハシ不動産",
    desc: "物件一覧・フィルター検索・スタッフ紹介・問い合わせフォーム完備",
    tags: ["コーポレートサイト", "検索機能"],
    url: "https://ai-company-2026-03-23t00-00-02-real-estate-7wzm7ktif.vercel.app",
  },
  {
    label: "フィットネスジム",
    title: "IRON GATE FITNESS",
    desc: "体験申込・トレーナー紹介・ビフォーアフター掲載のラグジュアリーサイト",
    tags: ["コーポレートサイト", "アニメーション"],
    url: "https://ai-company-2026-03-23t00-00-07-fitne-j3gxy9p5x.vercel.app",
  },
  {
    label: "法律事務所",
    title: "山田・鈴木法律事務所",
    desc: "初回無料相談フォーム・解決事例・ブログを備えた信頼感重視のサイト",
    tags: ["コーポレートサイト", "SEO対応"],
    url: "https://ai-company-2026-03-23t00-00-01-law-office-1qfsgb0m7.vercel.app",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-32 px-6 bg-[var(--bg-2)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20">
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>
            How it works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
            Machinaの仕組み
          </h2>
          <p className="text-[var(--muted)] max-w-lg leading-relaxed">
            11の専門AIサブエージェントが協調し、人間のソフトウェア開発会社と同じワークフローを全自動で実行します。

          </p>
        </div>

        {/* Workflow — numbered grid */}
        <div className="mb-24">
          <p className="text-xs text-[var(--muted)] tracking-widest uppercase mb-6">開発フロー</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 border border-[var(--border)]">
            {WORKFLOW_STEPS.map((step) => (
              <div
                key={step.num}
                className="p-5 border-r border-b border-[var(--border)] last:border-r-0 hover:bg-[var(--bg)] transition-colors group"
              >
                <div
                  className="text-xs font-mono font-bold mb-3"
                  style={{ color: "var(--accent)" }}
                >
                  {step.num}
                </div>
                <div className="text-sm font-semibold text-[var(--text)] mb-1">{step.label}</div>
                <div className="text-xs text-[var(--muted)] leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured works */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-[var(--muted)] tracking-widest uppercase">注目の実績</p>
            <a
              href="#projects"
              className="text-xs font-mono transition-colors"
              style={{ color: "var(--accent)" }}
            >
              すべての実績を見る →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)]">
            {FEATURED_WORKS.map((work) => (
              <a
                key={work.title}
                href={work.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 bg-[var(--bg-2)] hover:bg-[var(--bg)] transition-colors block group"
              >
                <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>
                  {work.label}
                </p>
                <div className="text-sm font-semibold text-[var(--text)] mb-2 group-hover:underline">
                  {work.title}
                </div>
                <div className="text-xs text-[var(--muted)] leading-relaxed mb-4">{work.desc}</div>
                <div className="flex flex-wrap gap-1">
                  {work.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 border border-[var(--border)] text-[var(--muted)] font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
