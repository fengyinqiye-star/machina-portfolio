import Link from "next/link";
import { NavBar } from "@/components/molecules/NavBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "料金プラン",
  description: "Machinaの開発費用・保守プランの料金一覧。受注から納品まで全自動のAI開発サービス。",
};

type DevPlan = {
  name: string;
  price: string;
  desc: string;
  badge?: string;
  features: string[];
  highlight?: boolean;
};

const DEV_PLANS: DevPlan[] = [
  {
    name: "ライト",
    price: "9,800円〜",
    desc: "LP・シンプルなWebサイト",
    badge: "フリーランスの1/5",
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
    price: "3.8万円〜",
    desc: "Webアプリ・多機能サイト",
    badge: "制作会社の1/10",
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
    price: "2,980円",
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
    price: "4,980円",
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
  {
    name: "プレミアムプラン",
    price: "19,800円",
    unit: "月",
    features: [
      "Vercelホスティング維持",
      "修正・機能追加（無制限）",
      "専任AIエージェント対応",
      "稼働監視・障害即時対応",
      "月次レポート",
      "最優先対応",
    ],
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
    a: "AIが案件内容を自動分析して工数を判断します。シンプルなLPで1〜3日、Webアプリで3〜7日が目安です。見積もりは無料でお気軽にご相談ください。",
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
            <p className="text-[var(--muted)] leading-relaxed max-w-xl mb-6">
              AIエージェントが全工程を自動実行するため、従来の開発会社より低コストで高品質な開発が可能です。
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 border text-sm font-semibold" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent)" }} />
              初期ユーザー獲得キャンペーン中 — 実績作りのため大幅値下げ実施中
            </div>
          </div>
        </section>

        {/* なぜ低価格か */}
        <section className="py-16 px-6 border-b border-[var(--border)]">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
              Why so affordable?
            </p>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-8">
              なぜフリーランスの1/5の価格が実現できるのか
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "人件費ゼロ",
                  body: "AIエージェントが要件定義・設計・実装・テスト・デプロイを自動実行します。人間のエンジニアへの報酬が発生しません。",
                },
                {
                  title: "24時間稼働",
                  body: "AIは休まず並列で動きます。人間なら数週間かかる工程を、24時間以内に完了します。時間コストが根本的に異なります。",
                },
                {
                  title: "品質は落とさない",
                  body: "テストカバレッジ80%以上・セキュリティレビュー・コードレビューをすべてAIが実施。安いからといって手を抜きません。",
                },
              ].map(({ title, body }) => (
                <div key={title} className="border-l-2 pl-6" style={{ borderColor: "var(--accent)" }}>
                  <p className="font-semibold text-[var(--text)] mb-2">{title}</p>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
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
                  {plan.badge && (
                    <span
                      className="text-[10px] tracking-widest uppercase font-mono mb-2 inline-block px-2 py-0.5 border"
                      style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                    >
                      {plan.badge}
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
            <div className="mt-8 p-6 border border-[var(--border)] bg-[var(--bg)]">
              <p className="text-sm font-semibold text-[var(--text)] mb-1">ライトとスタンダード、どちらか迷ったら？</p>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                プランは選ばなくて大丈夫です。フォームにやりたいことを書いて送信するだけで、
                AIエージェントが内容を分析して最適なプランと費用をご提案します。
              </p>
              <a
                href="/#contact"
                className="inline-block mt-4 text-sm font-semibold underline underline-offset-4"
                style={{ color: "var(--accent)" }}
              >
                まずは内容を送ってみる →
              </a>
            </div>
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

            <div className="grid md:grid-cols-3 gap-px bg-[var(--border)]">
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
        <p>© 2026 Machina. All rights reserved.</p>
      </footer>
    </>
  );
}
