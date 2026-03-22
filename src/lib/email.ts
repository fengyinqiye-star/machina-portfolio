import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS = "Machina <noreply@ai-company.dev>";
const COMPANY_NAME = "Machina";
const OWNER_EMAIL = process.env.OWNER_EMAIL ?? "fengyinqiye@gmail.com";

// RFC 2047 B-encoding: 非ASCII文字を含む件名をメールクライアント互換に変換
function encodeSubject(subject: string): string {
  if (/^[\x20-\x7E]*$/.test(subject)) return subject;
  const b64 = Buffer.from(subject, "utf8").toString("base64");
  return `=?UTF-8?B?${b64}?=`;
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

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: encodeSubject(`【受注確認】${projectName} のご依頼を受け付けました`),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; color: #111; background: #fafaf8; padding: 32px;">
  <h1 style="font-size: 20px; margin-bottom: 8px;">${COMPANY_NAME}</h1>
  <p style="color: #88857f; font-size: 13px; margin-bottom: 32px;">AI-Powered Development</p>

  <p>${contactName} 様</p>
  <p>このたびはご依頼いただきありがとうございます。<br>以下の案件を受け付けました。</p>

  <table style="border-collapse: collapse; margin: 24px 0; width: 100%;">
    <tr>
      <td style="padding: 8px 16px 8px 0; color: #88857f; font-size: 13px; white-space: nowrap;">案件名</td>
      <td style="padding: 8px 0; font-weight: bold;">${projectName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 16px 8px 0; color: #88857f; font-size: 13px;">案件ID</td>
      <td style="padding: 8px 0; font-family: monospace; font-size: 13px;">${orderId}</td>
    </tr>
  </table>

  <p>AIエージェントチームが全工程（要件定義→設計→実装→テスト→レビュー→納品）を自動実行します。<br>
  完了次第、納品完了の通知をお送りします。</p>

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

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: encodeSubject(`【納品完了】${projectName} の開発が完了しました`),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; color: #111; background: #fafaf8; padding: 32px;">
  <h1 style="font-size: 20px; margin-bottom: 8px;">${COMPANY_NAME}</h1>
  <p style="color: #88857f; font-size: 13px; margin-bottom: 32px;">AI-Powered Development</p>

  <p>${contactName} 様</p>
  <p>AIエージェントチームによる開発が完了しました。</p>

  <table style="border-collapse: collapse; margin: 24px 0; width: 100%;">
    <tr>
      <td style="padding: 8px 16px 8px 0; color: #88857f; font-size: 13px; white-space: nowrap;">案件名</td>
      <td style="padding: 8px 0; font-weight: bold;">${projectName}</td>
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

  <p>納品物は <code>deliverables/${orderId}/</code> に格納されています。<br>
  README.md に従ってセットアップすることでご利用いただけます。</p>

  <hr style="border: none; border-top: 1px solid #e0ddd8; margin: 32px 0;">
  <p style="color: #88857f; font-size: 12px;">${COMPANY_NAME} — Automated Development</p>
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
    subject: encodeSubject(`【新規受注】${projectName}`),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; color: #111; background: #fafaf8; padding: 32px;">
  <h2 style="font-size: 18px;">新しい案件依頼が届きました</h2>

  <table style="border-collapse: collapse; margin: 24px 0; width: 100%;">
    <tr><td style="padding: 6px 16px 6px 0; color: #88857f; font-size: 13px;">案件ID</td><td style="font-family: monospace; font-size: 13px;">${orderId}</td></tr>
    <tr><td style="padding: 6px 16px 6px 0; color: #88857f; font-size: 13px;">案件名</td><td style="font-weight: bold;">${projectName}</td></tr>
    <tr><td style="padding: 6px 16px 6px 0; color: #88857f; font-size: 13px;">依頼者</td><td>${contactName}（${contactEmail}）</td></tr>
    <tr><td style="padding: 6px 16px 6px 0; color: #88857f; font-size: 13px; vertical-align: top;">概要</td><td>${overview}</td></tr>
  </table>

  <hr style="border: none; border-top: 1px solid #e0ddd8; margin: 32px 0;">
  <p style="color: #88857f; font-size: 12px;">${COMPANY_NAME} 自動通知</p>
</body>
</html>
    `.trim(),
  });
}
