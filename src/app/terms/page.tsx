import { NavBar } from "@/components/molecules/NavBar";

export const metadata = {
  title: "利用規約・個人情報取り扱い",
  description: "Machinaのサービス利用規約および個人情報の取り扱いについて",
  alternates: { canonical: "https://ai-company.dev/terms" },
  openGraph: {
    title: "利用規約・個人情報取り扱い | Machina",
    description: "Machinaのサービス利用規約および個人情報の取り扱いについて",
    url: "https://ai-company.dev/terms",
  },
};

export default function TermsPage() {
  const updated = "2026年3月25日";

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">利用規約・個人情報取り扱い</h1>
        <p className="text-xs text-[var(--muted)] mb-12">最終更新: {updated}</p>

        <section className="space-y-10 text-sm text-[var(--text)] leading-relaxed">

          <div>
            <h2 className="text-base font-semibold mb-3 border-b border-[var(--border)] pb-2">第1条（サービス内容）</h2>
            <p>
              Machina（以下「当社」）は、AIエージェントを用いたソフトウェア開発の受注・納品サービス（以下「本サービス」）を提供します。
              本規約は、本サービスを利用するすべてのお客様に適用されます。
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-3 border-b border-[var(--border)] pb-2">第2条（料金・支払い）</h2>
            <ul className="list-disc list-inside space-y-1 text-[var(--muted)]">
              <li>見積もり・相談は無料です。</li>
              <li>表示価格は参考目安です。実際の開発費用はヒアリング後に確定し、発注書にてお知らせします。</li>
              <li>開発着手前にStripeを通じた事前決済が必要です。</li>
              <li>
                <strong className="text-[var(--text)]">キャンセル・返金</strong>：
                「開発着手」とは、お客様のヒアリング回答をもとにAIエージェントが実装を開始した時点を指します。
                着手前のキャンセルは全額返金します。着手後のキャンセルは原則お受けできません。
              </li>
              <li>
                <strong className="text-[var(--text)]">追加要件</strong>：
                ヒアリング確定後に追加・変更が生じた場合は、別途お見積もりをご提示します。
              </li>
              <li>
                <strong className="text-[var(--text)]">保守プランの解約</strong>：
                翌月以降いつでも解約できます。納品メール記載の解約ページからお手続きください。解約後14日間はサービスを継続し、残存期間分を日割り計算で自動返金します。
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-3 border-b border-[var(--border)] pb-2">第3条（納品・修正・瑕疵担保）</h2>
            <ul className="list-disc list-inside space-y-1 text-[var(--muted)]">
              <li>納品物はGitHubリポジトリおよびVercel URLにて引き渡します。</li>
              <li>検収期間は納品後7〜14日です。</li>
              <li>
                <strong className="text-[var(--text)]">無償修正の範囲</strong>：
                検収完了後30日以内の以下に該当する不具合は無償対応します。
                <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                  <li>サイト全体が表示されない</li>
                  <li>発注書に記載された主要機能が動作しない</li>
                  <li>CVSS 7.0以上のセキュリティ脆弱性</li>
                </ul>
              </li>
              <li>
                <strong className="text-[var(--text)]">無償修正の対象外</strong>：
                テキスト・画像・色・レイアウトの変更、ヒアリング時に含まれていなかった機能追加、
                お客様の操作方法に起因するもの。
              </li>
              <li>
                <strong className="text-[var(--text)]">修正の定義</strong>：
                「軽微な修正」とはテキスト・画像・色・レイアウトの変更を指します。
                新機能の追加・既存機能の仕様変更は「機能追加」として別途お見積もりとなります。
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-3 border-b border-[var(--border)] pb-2">第4条（サービスの終了・変更）</h2>
            <p className="mb-3">
              当社は、事業上の理由により本サービスを終了または変更する場合があります。
            </p>
            <ul className="list-disc list-inside space-y-1 text-[var(--muted)]">
              <li>
                <strong className="text-[var(--text)]">終了通知</strong>：サービス終了の場合、
                原則として<strong className="text-[var(--text)]">終了日の60日前まで</strong>に、
                登録メールアドレスへ通知いたします。
              </li>
              <li>
                <strong className="text-[var(--text)]">進行中案件</strong>：終了告知時点で進行中の案件は、
                可能な限り完了まで対応するか、完了が困難な場合は未完了分を返金いたします。
              </li>
              <li>
                <strong className="text-[var(--text)]">保守プラン</strong>：終了告知月以降の月額費用は請求いたしません。
              </li>
              <li>
                <strong className="text-[var(--text)]">成果物の継続利用</strong>：
                サービス終了後も、納品済みの成果物（コード・Vercelデプロイ等）はお客様自身で継続利用できます。
                HANDOVER.md に引き継ぎ手順を記載して納品しています。
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-3 border-b border-[var(--border)] pb-2">第5条（個人情報の取り扱い）</h2>
            <p className="mb-3">
              当社は、個人情報保護法を遵守し、以下の方針でお客様の個人情報を取り扱います。
            </p>
            <ul className="list-disc list-inside space-y-1 text-[var(--muted)]">
              <li>
                <strong className="text-[var(--text)]">収集する情報</strong>：お名前・メールアドレス・案件内容
              </li>
              <li>
                <strong className="text-[var(--text)]">利用目的</strong>：見積もり・開発・納品・サポートの提供、および進捗通知メールの送信
              </li>
              <li>
                <strong className="text-[var(--text)]">第三者提供</strong>：法令に基づく場合を除き、第三者に提供しません。
                ただし、開発・メール送信のためにVercel・Resend等のサービスを利用します。
              </li>
              <li>
                <strong className="text-[var(--text)]">保存期間</strong>：案件完了から1年間保存後、削除します。
              </li>
              <li>
                <strong className="text-[var(--text)]">サービス終了時</strong>：終了から90日以内にすべての個人情報を削除し、
                削除完了をメールでお知らせします。
              </li>
              <li>
                <strong className="text-[var(--text)]">開示・削除請求</strong>：
                お問い合わせフォームより受け付けます。
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-3 border-b border-[var(--border)] pb-2">第6条（サポート対応）</h2>
            <ul className="list-disc list-inside space-y-1 text-[var(--muted)]">
              <li>お問い合わせは autocode.2603@gmail.com にて受け付けます。</li>
              <li>平日のメール返信は受信から72時間以内を目安とします。</li>
              <li>プレミアムプランご契約中のお客様は24時間以内に対応します。</li>
              <li>電話対応はおこなっておりません。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-3 border-b border-[var(--border)] pb-2">第7条（免責事項）</h2>
            <ul className="list-disc list-inside space-y-1 text-[var(--muted)]">
              <li>AIによる開発成果物の完全性・正確性を保証するものではありません。</li>
              <li>お客様の提供情報の誤りに起因する損害について、当社は責任を負いません。</li>
              <li>天災・通信障害等の不可抗力による遅延・中断について、当社は責任を負いません。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-3 border-b border-[var(--border)] pb-2">第8条（準拠法・管轄）</h2>
            <p className="text-[var(--muted)]">
              本規約は日本法に準拠し、紛争が生じた場合は東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </div>

        </section>

        <p className="mt-16 text-xs text-[var(--muted)] text-center">
          ご不明な点は受注フォームよりお問い合わせください。
        </p>
      </main>
    </>
  );
}
