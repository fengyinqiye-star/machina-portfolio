import { NavBar } from "@/components/molecules/NavBar";

export const metadata = {
  title: "特定商取引法に基づく表記",
  description: "Machinaの特定商取引法に基づく表記。販売事業者・連絡先・料金・キャンセルポリシー等の開示情報。",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://ai-company.dev/legal" },
  openGraph: {
    title: "特定商取引法に基づく表記 | Machina",
    description: "Machinaの特定商取引法に基づく表記。販売事業者・連絡先・料金・キャンセルポリシー等の開示情報。",
    url: "https://ai-company.dev/legal",
  },
};

const CONTACT_EMAIL = "autocode.2603@gmail.com";

export default function LegalPage() {
  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
          特定商取引法に基づく表記
        </h1>
        <p className="text-xs text-[var(--muted)] mb-12">
          最終更新: 2026年3月24日
        </p>

        <table className="w-full text-sm border-collapse">
          <tbody>
            {[
              ["事業者名", "Machina"],
              ["所在地", "大阪府（請求があれば速やかに開示します）"],
              ["電話番号", "請求があれば速やかに開示します"],
              ["メールアドレス", CONTACT_EMAIL],
              ["代表者", "請求があれば速やかに開示します"],
              ["販売価格", "各案件のお見積もりによります（見積もり・相談は無料）"],
              ["支払い方法", "クレジットカード（Stripe）"],
              ["支払い時期", "発注書確認後、開発着手前にお支払いいただきます"],
              ["サービス提供時期", "お支払い確認後、シンプルなLP・コーポレートサイトは2〜5営業日、Webアプリ・複合システムは5〜14営業日が目安です（要件の複雑さにより変動します）"],
              ["返品・キャンセル", "デジタルコンテンツの性質上、開発着手後のキャンセルはお受けできません。未着手の場合は全額返金いたします"],
              ["動作環境", "最新のChrome / Safari / Firefox / Edge（PC・スマートフォン）"],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-[var(--border)]">
                <th className="py-4 pr-6 text-left align-top font-medium text-[var(--text)] w-40 shrink-0">
                  {label}
                </th>
                <td className="py-4 text-[var(--muted)] leading-relaxed">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-12 text-xs text-[var(--muted)]">
          住所・電話番号・代表者名の開示請求は上記メールアドレスまでご連絡ください。遅滞なく開示いたします。
        </p>
      </main>
    </>
  );
}
