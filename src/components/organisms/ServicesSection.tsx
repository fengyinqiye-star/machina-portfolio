const WORKFLOW_STEPS = [
  { num: "01", label: "受注", desc: "フォームから案件依頼を受付" },
  { num: "02", label: "要件定義", desc: "PMエージェントが要件を整理" },
  { num: "03", label: "設計", desc: "Architectが設計書を作成" },
  { num: "04", label: "実装", desc: "FE/BE/Infraを並列実装" },
  { num: "05", label: "テスト", desc: "QAエージェントが品質検証" },
  { num: "06", label: "レビュー", desc: "セキュリティ・品質チェック" },
  { num: "07", label: "納品", desc: "Vercelデプロイ可能な状態で納品" },
];

const AGENTS = [
  { name: "orchestrator", role: "COO / オーケストレーター", desc: "全工程の指揮・品質ゲート管理", model: "opus" },
  { name: "sales", role: "営業エージェント", desc: "初期分析・工数見積もり", model: "sonnet" },
  { name: "pm", role: "プロジェクトマネージャー", desc: "要件定義・スコープ管理", model: "opus" },
  { name: "architect", role: "シニアアーキテクト", desc: "システム設計・技術選定", model: "opus" },
  { name: "developer", role: "開発チームリーダー", desc: "FE/BE/Infra並列実装統括", model: "opus" },
  { name: "qa", role: "QAエンジニア", desc: "テスト設計・品質保証", model: "opus" },
  { name: "code-reviewer", role: "コードレビューアー", desc: "セキュリティ・品質レビュー", model: "opus" },
  { name: "deliverer", role: "納品担当", desc: "成果物統合・ドキュメント整備", model: "sonnet" },
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

        {/* Agents grid */}
        <div>
          <p className="text-xs text-[var(--muted)] tracking-widest uppercase mb-6">エージェントチーム</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)]">
            {AGENTS.map((agent) => (
              <div
                key={agent.name}
                className="p-6 bg-[var(--bg-2)] hover:bg-[var(--bg)] transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <code className="text-xs font-mono" style={{ color: "var(--accent)" }}>
                    @{agent.name}
                  </code>
                  <span className="text-[10px] px-2 py-0.5 border border-[var(--border)] text-[var(--muted)] font-mono">
                    {agent.model}
                  </span>
                </div>
                <div className="text-sm font-semibold text-[var(--text)] mb-1">{agent.role}</div>
                <div className="text-xs text-[var(--muted)] leading-relaxed">{agent.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
