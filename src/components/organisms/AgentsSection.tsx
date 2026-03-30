const AGENTS = [
  { id: "01", name: "Orchestrator", role: "総指揮", desc: "全エージェントを協調指示。案件の進行管理" },
  { id: "02", name: "Sales", role: "営業", desc: "要件ヒアリング・見積もり・提案" },
  { id: "03", name: "Secretary", role: "秘書", desc: "顧客コミュニケーション・スケジュール調整" },
  { id: "04", name: "Contract", role: "契約", desc: "注文書作成・支払い処理（Stripe）" },
  { id: "05", name: "PM", role: "プロジェクト管理", desc: "要件定義・スコープ管理・ユーザーストーリー" },
  { id: "06", name: "Architect", role: "設計", desc: "システム設計・技術選定・DB設計" },
  { id: "07", name: "Developer", role: "実装統括", desc: "FE/BE/Infraを統括・コードレビュー指示" },
  { id: "08", name: "Frontend Dev", role: "フロントエンド", desc: "Next.js・React・Tailwind CSS実装" },
  { id: "09", name: "Backend Dev", role: "バックエンド", desc: "API設計・DB操作・認証実装" },
  { id: "10", name: "Infra Dev", role: "インフラ", desc: "Vercelデプロイ・環境構築・CI/CD" },
  { id: "11", name: "QA", role: "品質保証", desc: "Vitest・Playwright・Lighthouse計測" },
  { id: "12", name: "Code Reviewer", role: "コードレビュー", desc: "セキュリティ・保守性・パフォーマンス審査" },
  { id: "13", name: "UX Reviewer", role: "UXレビュー", desc: "アクセシビリティ・導線・モバイル対応確認" },
  { id: "14", name: "Notification", role: "通知", desc: "顧客へのメール自動送信（Resend）" },
  { id: "15", name: "Deliverer", role: "納品", desc: "GitHub push・Vercelデプロイ・HANDOVER.md作成" },
  { id: "16", name: "Maintenance", role: "保守", desc: "納品後のバグ対応・修正依頼ハンドリング" },
];

const PRICING = [
  {
    label: "ライト — LP・シンプルなWebサイト",
    price: "9,800円〜",
    days: "2〜3日",
    badge: "フリーランスの1/5",
    features: ["静的サイト・LP（5ページ以内）", "お問い合わせフォーム", "Lighthouse 90以上保証", "検収後30日間の瑕疵担保"],
  },
  {
    label: "スタンダード — Webアプリ・多機能サイト",
    price: "3.8万円〜",
    days: "3〜7日",
    badge: "制作会社の1/10",
    features: ["認証・データベース連携", "API設計・実装", "テストカバレッジ80%以上", "検収後30日間の瑕疵担保"],
    highlight: true,
  },
  {
    label: "エンタープライズ — 大規模システム",
    price: "要相談",
    days: "要相談",
    badge: "",
    features: ["マイクロサービス構成", "CI/CD・インフラ構築", "セキュリティ要件対応", "検収後30日間の瑕疵担保"],
  },
];

export function AgentsSection() {
  return (
    <>
      {/* Agents section */}
      <section id="agents" className="py-32 px-6 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>
              16 AI Agents
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
              16人のAIが<br />24時間365日稼働
            </h2>
            <p className="text-[var(--muted)] max-w-lg leading-relaxed">
              人間の開発チームと同じ役割分担で、受注から納品まで全工程を自律実行します。
              夜中でも、週末でも、依頼した瞬間から動きはじめます。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 border border-[var(--border)]">
            {AGENTS.map((agent) => (
              <div
                key={agent.id}
                className="p-4 border-r border-b border-[var(--border)] group hover:bg-[var(--bg-2)] transition-colors"
              >
                <div className="text-[10px] font-mono mb-2" style={{ color: "var(--accent)" }}>
                  {agent.id}
                </div>
                <div className="text-xs font-semibold text-[var(--text)] mb-0.5">{agent.name}</div>
                <div className="text-[10px] text-[var(--muted)] mb-2">{agent.role}</div>
                <div className="text-[10px] text-[var(--muted)] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">
                  {agent.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Guarantees */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--border)]">
            {[
              {
                label: "Lighthouse 全項目90以上保証",
                desc: "Performance・SEO・Accessibility すべて90以上。基準未達なら無償修正。",
              },
              {
                label: "24時間365日 自動稼働",
                desc: "人間の営業時間に縛られません。依頼した瞬間からエージェントが動きはじめます。",
              },
              {
                label: "ソースコード全納品",
                desc: "GitHubリポジトリごと完全移管。ベンダーロックインなし。自社で保守できます。",
              },
            ].map((g) => (
              <div key={g.label} className="p-8 bg-[var(--bg-2)]">
                <div className="text-sm font-semibold text-[var(--text)] mb-2">{g.label}</div>
                <div className="text-xs text-[var(--muted)] leading-relaxed">{g.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing section */}
      <section id="pricing" className="py-32 px-6 bg-[var(--bg-2)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>
              Pricing
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
              料金目安
            </h2>
            <p className="text-[var(--muted)] max-w-lg leading-relaxed">
              見積もり・相談はすべて無料です。要件によって変動するため、まずはフォームからご依頼ください。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--border)]">
            {PRICING.map((plan) => (
              <div
                key={plan.label}
                className={`p-8 ${plan.highlight ? "bg-[var(--text)]" : "bg-[var(--bg)]"}`}
              >
                <div
                  className="text-[10px] font-mono tracking-widest uppercase mb-4"
                  style={{ color: plan.highlight ? "var(--accent)" : "var(--muted)" }}
                >
                  {plan.label}
                </div>
                <div
                  className={`text-4xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-[var(--text)]"}`}
                >
                  {plan.price}
                </div>
                <div className={`text-xs mb-1 ${plan.highlight ? "text-gray-400" : "text-[var(--muted)]"}`}>
                  納品目安: {plan.days}
                </div>
                {plan.badge && (
                  <div className="text-[10px] font-mono mb-6" style={{ color: "var(--accent)" }}>
                    {plan.badge}
                  </div>
                )}
                {!plan.badge && <div className="mb-6" />}
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`text-xs flex items-center gap-2 ${plan.highlight ? "text-gray-300" : "text-[var(--muted)]"}`}
                    >
                      <span style={{ color: "var(--accent)" }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-[var(--muted)] text-center">
            ※ 表示は参考価格です。要件・規模によって変動します。正式見積もりは無料でお出しします。
          </p>
        </div>
      </section>
    </>
  );
}
