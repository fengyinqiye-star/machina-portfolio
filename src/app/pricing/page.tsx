import Link from "next/link";
import { NavBar } from "@/components/molecules/NavBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "料金プラン",
  description: "AI Companyの開発費用・保守プランの料金一覧。受注から納品まで全自動のAI開発サービス。",
};

const DEV_PLANS = [
  {
    name: "ライト",
    price: "5万円〜",
    desc: "LP・シンプルなWebサイト",
    features: [
      "静的サイト・LP",
      "5ページ以内",
      "お問い合わせフォーム",
      "レスポンシブ対応",
      "GitHub + Vercelデプロイ",
      "納品後30日無償サポート",
    ],
  },
  {
    name: "スタンダード",
    price: "15万円〜",
    desc: "Webアプリ・多機能サイト",
    features: [
      "Webアプリ・管理画面",
      "認証・データベース連携",
      "API設計・実装",
      "テストカバレッジ80%以上",
      "GitHub + Vercelデプロイ",
      "納品後30日無償サポート",
    ],
    highlight: true,
  },
  {
    name: "エンタープライズ",
    price: "要相談",
    desc: "大規模システム・複雑な要件",
    features: [
      "大規模Webサービス",
      "マイクロサービス構成",
      "CI/CD・インフラ構築",
      "セキュリティ要件対応",
      "GitHub + Vercelデプロイ",
      "納品後30日無償サポート",
    ],
  },
];

const MAINTENANCE_PLANS = [
  {
    name: "ライトプラン",
    price: "5,000円",
    unit: "月",
    features: [
      "Vercelホスティング維持",
      "軽微なテキスト・画像修正（月2回まで）",
      "稼働監視",
      "月次レポート",
    ],
  },
  {
    name: "スタンダードプラン",
    price: "10,000円",
    unit: "月",
    features: [
      "Vercelホスティング維持",
      "修正対応（回数無制限）",
      "機能追加（小規模）",
      "稼働監視",
      "月次レポート",
      "優先対応",
    ],
    highlight: true,
  },
];

const FAQS = [
  {
    q: "見積もりはどのくらいかかりますか？",
    a: "フォームからご依頼いただいた後、AIエージェントが自動で分析し、24時間以内に概算見積もりをお送りします。",
  },
  {
    q: "修正は何回できますか？",
    a: "納品後30日間は軽微な修正を無償で対応します。それ以降は保守プランへのご加入、または別途お見積もりとなります。",
  },
  {
    q: "納品までどのくらいかかりますか？",
    a: "案件の規模によって異なります。シンプルなLPで1〜3日、Webアプリで3〜7日が目安です。",
  },
  {
    q: "保守プランを途中で解約できますか？",
    a: "いつでも解約可能です。解約後はVercelのホスティングが停止されますが、GitHubのソースコードはお手元に残ります。",
  },
];

export default function PricingPage() {
  return (
    <>
      <NavBar />
      <main className="bg-[var(--bg)] min-h-screen">
        {/* Hero */}
        <section className="py-24 px-6 border-b border-[var(--border)]">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
              Pricing
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
              シンプルな料金体系
            </h1>
            <p className="text-[var(--muted)] leading-relaxed max-w-xl">
              AIエージェントが全工程を自動実行するため、従来の開発会社より低コストで高品質な開発が可能です。
            </p>
          </div>
        </section>

        {/* 開発費用 */}
        <section className="py-20 px-6 bg-[var(--bg-2)]">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs text-[var(--muted)] tracking-widest uppercase mb-2">Development</p>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-12">開発費用</h2>

            <div className="grid md:grid-cols-3 gap-px bg-[var(--border)]">
              {DEV_PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-8 flex flex-col ${plan.highlight ? "bg-[var(--text)]" : "bg-[var(--bg-2)]"}`}
                >
                  {plan.highlight && (
                    <span
                      className="text-[10px] tracking-widest uppercase font-mono mb-4 inline-block"
                      style={{ color: "var(--accent)" }}
                    >
                      Most Popular
                    </span>
                  )}
                  <div className={`text-xs tracking-widest uppercase mb-2 ${plan.highlight ? "text-[var(--bg)]" : "text-[var(--muted)]"}`}>
                    {plan.name}
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${plan.highlight ? "text-[var(--bg)]" : "text-[var(--text)]"}`}>
                    {plan.price}
                  </div>
                  <div className={`text-xs mb-6 ${plan.highlight ? "text-[var(--muted)]" : "text-[var(--muted)]"}`}>
                    {plan.desc}
                  </div>
                  <ul className="space-y-2 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className={`text-sm flex items-start gap-2 ${plan.highlight ? "text-[var(--bg-2)]" : "text-[var(--muted)]"}`}>
                        <span style={{ color: "var(--accent)" }} className="mt-0.5 shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.price === "要相談" ? "/#contact" : "/#contact"}
                    className={`text-center text-sm py-3 px-6 border transition-colors ${
                      plan.highlight
                        ? "border-[var(--bg)] text-[var(--bg)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
                        : "border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    }`}
                  >
                    {plan.price === "要相談" ? "相談する" : "依頼する"}
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-xs text-[var(--muted)] mt-4">
              ※ 表示価格は税抜きです。要件によって変動する場合があります。
            </p>
          </div>
        </section>

        {/* 保守プラン */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs text-[var(--muted)] tracking-widest uppercase mb-2">Maintenance</p>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">月額保守プラン</h2>
            <p className="text-[var(--muted)] text-sm mb-12">
              納品後もAIエージェントが継続してホスティングと修正対応を行います。
              加入しない場合も30日間は無償サポートを提供します。
            </p>

            <div className="grid md:grid-cols-2 gap-px bg-[var(--border)] max-w-2xl">
              {MAINTENANCE_PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-8 ${plan.highlight ? "bg-[var(--bg-2)] border border-[var(--accent)]" : "bg-[var(--bg-2)]"}`}
                >
                  {plan.highlight && (
                    <span
                      className="text-[10px] tracking-widest uppercase font-mono mb-4 inline-block"
                      style={{ color: "var(--accent)" }}
                    >
                      Recommended
                    </span>
                  )}
                  <div className="text-xs text-[var(--muted)] tracking-widest uppercase mb-2">{plan.name}</div>
                  <div className="text-3xl font-bold text-[var(--text)] mb-1">
                    {plan.price}
                    <span className="text-sm font-normal text-[var(--muted)]">/{plan.unit}</span>
                  </div>
                  <ul className="space-y-2 mt-6">
                    {plan.features.map((f) => (
                      <li key={f} className="text-sm flex items-start gap-2 text-[var(--muted)]">
                        <span style={{ color: "var(--accent)" }} className="mt-0.5 shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--muted)] mt-4">
              ※ 保守プランは納品後の申込みページからご加入いただけます。
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 bg-[var(--bg-2)]">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-[var(--muted)] tracking-widest uppercase mb-2">FAQ</p>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-12">よくある質問</h2>
            <div className="divide-y divide-[var(--border)]">
              {FAQS.map((faq) => (
                <div key={faq.q} className="py-6">
                  <p className="font-semibold text-[var(--text)] mb-2">{faq.q}</p>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center border-t border-[var(--border)]">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-4">まずは相談してみる</h2>
            <p className="text-[var(--muted)] mb-8 leading-relaxed">
              フォームからご依頼いただくと、AIエージェントが自動で分析・見積もりを行います。
            </p>
            <Link
              href="/#contact"
              className="inline-block px-8 py-4 text-sm font-bold tracking-wide transition-colors"
              style={{ background: "var(--accent)", color: "#111" }}
            >
              案件を依頼する
            </Link>
          </div>
        </section>
      </main>
      <footer className="py-10 text-center text-xs text-[var(--muted)] border-t border-[var(--border)]">
        <p>© 2026 AI Company. All rights reserved.</p>
      </footer>
    </>
  );
}
