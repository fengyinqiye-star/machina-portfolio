import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS = "Machina <noreply@ai-company.dev>";
const COMPANY_NAME = "Machina";
const OWNER_EMAIL = process.env.OWNER_EMAIL ?? "fengyinqiye@gmail.com";

// HTMLエスケープ（メール本文内のユーザー入力を安全化）
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}


export async function sendOrderConfirmation(params: {
  to: string;
  contactName: string;
  projectName: string;
  orderId: string;
}): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY未設定 — メール送信をスキップ");
    return;
  }

  const { to, contactName, projectName, orderId } = params;
  const statusUrl = `https://ai-company.dev/status/${orderId}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `【受注確認】${projectName} のご依頼を受け付けました`,
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; color: #111; background: #fafaf8; padding: 32px;">
  <h1 style="font-size: 20px; margin-bottom: 8px;">${COMPANY_NAME}</h1>
  <p style="color: #88857f; font-size: 13px; margin-bottom: 32px;">AI-Powered Development</p>

  <p>${esc(contactName)} 様</p>
  <p>このたびはご依頼いただきありがとうございます。<br>以下の案件を受け付けました。</p>

  <table style="border-collapse: collapse; margin: 24px 0; width: 100%;">
    <tr>
      <td style="padding: 8px 16px 8px 0; color: #88857f; font-size: 13px; white-space: nowrap;">案件名</td>
      <td style="padding: 8px 0; font-weight: bold;">${esc(projectName)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 16px 8px 0; color: #88857f; font-size: 13px;">案件ID</td>
      <td style="padding: 8px 0; font-family: monospace; font-size: 13px;">${orderId}</td>
    </tr>
  </table>

  <p>AIエージェントチームが全工程（要件定義→設計→実装→テスト→レビュー→納品）を自動実行します。<br>
  次のステップとして、詳細のヒアリングメールをお送りする場合があります。<br>
  完了次第、納品完了の通知をお送りします。</p>

  <p style="margin: 24px 0;">
    <a href="${statusUrl}" style="display: inline-block; background: #a8e63a; color: #111; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px;">
      進捗状況を確認する →
    </a>
  </p>
  <p style="color: #88857f; font-size: 12px;">上のボタンが開かない場合: ${statusUrl}</p>

  <hr style="border: none; border-top: 1px solid #e0ddd8; margin: 32px 0;">
  <p style="color: #88857f; font-size: 12px;">${COMPANY_NAME} — Automated Development</p>
</body>
</html>
    `.trim(),
  });
}

export async function sendDeliveryNotification(params: {
  to: string;
  contactName: string;
  projectName: string;
  orderId: string;
}): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY未設定 — メール送信をスキップ");
    return;
  }

  const { to, contactName, projectName, orderId } = params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-company.dev";
  const feedbackUrl = `${siteUrl}/feedback/${orderId}`;
  const cancelUrl = `${siteUrl}/cancel/${orderId}`;
  const statusUrl = `${siteUrl}/status/${orderId}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `【納品完了】${projectName} の開発が完了しました`,
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; color: #111; background: #fafaf8; padding: 32px; max-width: 640px;">
  <h1 style="font-size: 20px; margin-bottom: 8px;">${COMPANY_NAME}</h1>
  <p style="color: #88857f; font-size: 13px; margin-bottom: 32px;">AI-Powered Development</p>

  <p>${esc(contactName)} 様</p>
  <p>AIエージェントチームによる開発が完了しました。</p>

  <table style="border-collapse: collapse; margin: 24px 0; width: 100%;">
    <tr>
      <td style="padding: 8px 16px 8px 0; color: #88857f; font-size: 13px; white-space: nowrap;">案件名</td>
      <td style="padding: 8px 0; font-weight: bold;">${esc(projectName)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 16px 8px 0; color: #88857f; font-size: 13px;">案件ID</td>
      <td style="padding: 8px 0; font-family: monospace; font-size: 13px;">${orderId}</td>
    </tr>
    <tr>
      <td style="padding: 8px 16px 8px 0; color: #88857f; font-size: 13px;">ステータス</td>
      <td style="padding: 8px 0; color: #a8e63a; font-weight: bold;">納品完了</td>
    </tr>
  </table>

  <p>納品物のURL・セットアップ手順などは、別途メールにてご案内いたします。<br>
  ご不明な点がございましたら、このメールへの返信でお気軽にお問い合わせください。</p>

  <div style="margin: 24px 0; display: flex; flex-direction: column; gap: 8px;">
    <a href="${statusUrl}" style="display: inline-block; background: #a8e63a; color: #111; font-weight: bold; padding: 12px 24px; text-decoration: none; font-size: 14px; margin-bottom: 8px;">
      進捗・修正依頼を確認する →
    </a>
    <a href="${feedbackUrl}" style="display: inline-block; color: #88857f; font-size: 12px; text-decoration: underline;">
      修正を依頼する
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e0ddd8; margin: 32px 0;">
  <p style="color: #88857f; font-size: 11px; line-height: 1.8;">
    保守プランにご加入中の場合、解約は
    <a href="${cancelUrl}" style="color: #88857f;">${cancelUrl}</a>
    から手続きいただけます（日割り返金あり）。
  </p>
  <p style="color: #88857f; font-size: 12px;">${COMPANY_NAME} — Automated Development</p>
</body>
</html>
    `.trim(),
  });
}

export async function sendRevisionConfirmation(params: {
  to: string;
  contactName: string;
  projectName: string;
  feedback: string;
  revisionNo: number;
  orderId: string;
}): Promise<void> {
  if (!resend) return;

  const { to, contactName, projectName, feedback, revisionNo, orderId } = params;
  const feedbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-company.dev"}/feedback/${orderId}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `【修正依頼受付】${projectName}`,
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; color: #111; background: #fafaf8; padding: 32px; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #111; font-size: 20px; margin-bottom: 4px;">Machina</h2>
  <hr style="border: none; border-top: 1px solid #e0ddd8; margin: 16px 0 24px;">

  <p>${esc(contactName)} 様</p>
  <p>修正依頼 #${revisionNo} を受け付けました。<br>内容を確認次第、対応を開始いたします。</p>

  <div style="background: #f5f4f0; border-left: 3px solid #a8e63a; padding: 16px 20px; margin: 24px 0; border-radius: 0 6px 6px 0;">
    <p style="color: #88857f; font-size: 12px; margin: 0 0 8px;">ご依頼内容</p>
    <p style="margin: 0; white-space: pre-wrap;">${esc(feedback)}</p>
  </div>

  <table style="border-collapse: collapse; margin: 24px 0; width: 100%;">
    <tr><td style="padding: 6px 16px 6px 0; color: #88857f; font-size: 13px;">案件名</td><td>${esc(projectName)}</td></tr>
    <tr><td style="padding: 6px 16px 6px 0; color: #88857f; font-size: 13px;">修正番号</td><td>#${revisionNo}</td></tr>
  </table>

  <p style="margin: 24px 0;">追加の修正依頼はこちらから：</p>
  <p style="margin: 24px 0;">
    <a href="${feedbackUrl}" style="display: inline-block; padding: 12px 24px; background: #a8e63a; color: #111; text-decoration: none; font-weight: bold; border-radius: 6px;">修正依頼フォームへ</a>
  </p>

  <hr style="border: none; border-top: 1px solid #e0ddd8; margin: 32px 0;">
  <p style="color: #88857f; font-size: 12px;">${COMPANY_NAME} — noreply@ai-company.dev</p>
</body>
</html>
    `.trim(),
  });
}

export async function sendOwnerNotification(params: {
  contactName: string;
  contactEmail: string;
  projectName: string;
  overview: string;
  orderId: string;
}): Promise<void> {
  if (!resend) return;

  const { contactName, contactEmail, projectName, overview, orderId } = params;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: OWNER_EMAIL,
    subject: `【新規受注】${projectName}`,
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; color: #111; background: #fafaf8; padding: 32px;">
  <h2 style="font-size: 18px;">新しい案件依頼が届きました</h2>

  <table style="border-collapse: collapse; margin: 24px 0; width: 100%;">
    <tr><td style="padding: 6px 16px 6px 0; color: #88857f; font-size: 13px;">案件ID</td><td style="font-family: monospace; font-size: 13px;">${orderId}</td></tr>
    <tr><td style="padding: 6px 16px 6px 0; color: #88857f; font-size: 13px;">案件名</td><td style="font-weight: bold;">${esc(projectName)}</td></tr>
    <tr><td style="padding: 6px 16px 6px 0; color: #88857f; font-size: 13px;">依頼者</td><td>${esc(contactName)}（${esc(contactEmail)}）</td></tr>
    <tr><td style="padding: 6px 16px 6px 0; color: #88857f; font-size: 13px; vertical-align: top;">概要</td><td style="white-space: pre-wrap;">${esc(overview)}</td></tr>
  </table>

  <hr style="border: none; border-top: 1px solid #e0ddd8; margin: 32px 0;">
  <p style="color: #88857f; font-size: 12px;">${COMPANY_NAME} 自動通知</p>
</body>
</html>
    `.trim(),
  });
}

export async function sendCancellationConfirmation(params: {
  to: string;
  contactName: string;
  projectName: string;
  orderId: string;
  refundAmount: number;
  cancelledAt: string;
}): Promise<void> {
  if (!resend) return;

  const { to, contactName, projectName, orderId, refundAmount, cancelledAt } = params;
  const refundText = refundAmount > 0
    ? `¥${refundAmount.toLocaleString()} を元のお支払い方法へ返金処理します（通常3〜5営業日で反映）。`
    : "今月分は残存期間が短いため返金額は0円となります。";

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `【解約完了】${projectName} の保守プランを解約しました`,
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; color: #111; background: #fafaf8; padding: 32px; max-width: 640px;">
  <h1 style="font-size: 20px; margin-bottom: 8px;">${COMPANY_NAME}</h1>
  <p style="color: #88857f; font-size: 13px; margin-bottom: 32px;">AI-Powered Development</p>

  <p>${esc(contactName)} 様</p>
  <p>保守プランの解約手続きが完了しました。</p>

  <table style="border-collapse: collapse; margin: 24px 0; width: 100%;">
    <tr>
      <td style="padding: 8px 16px 8px 0; color: #88857f; font-size: 13px; white-space: nowrap;">案件名</td>
      <td style="padding: 8px 0; font-weight: bold;">${esc(projectName)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 16px 8px 0; color: #88857f; font-size: 13px;">解約日時</td>
      <td style="padding: 8px 0; font-size: 13px;">${cancelledAt}</td>
    </tr>
    <tr>
      <td style="padding: 8px 16px 8px 0; color: #88857f; font-size: 13px;">返金額</td>
      <td style="padding: 8px 0; font-weight: bold;">¥${refundAmount.toLocaleString()}</td>
    </tr>
  </table>

  <p style="font-size: 14px;">${refundText}</p>
  <p style="font-size: 13px; color: #88857f;">
    GitHubのソースコードは引き続きご利用いただけます。<br>
    ご不明な点は <a href="mailto:autocode.2603@gmail.com">autocode.2603@gmail.com</a> までご連絡ください。
  </p>

  <hr style="border: none; border-top: 1px solid #e0ddd8; margin: 32px 0;">
  <p style="color: #88857f; font-size: 12px;">${COMPANY_NAME} — Automated Development</p>
</body>
</html>
    `.trim(),
  });
}

