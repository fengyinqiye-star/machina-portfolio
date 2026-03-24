import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { checkRateLimit } from "@/lib/rateLimit";

// brief.md から保守プランを解析
function parsePlan(content: string): "none" | "basic" | "standard" | "premium" {
  const match = content.match(/## 保守プラン\n([^\n]+)/);
  if (!match) return "none";
  const line = match[1];
  if (line.includes("プレミアム")) return "premium";
  if (line.includes("スタンダード")) return "standard";
  if (line.includes("基本")) return "basic";
  return "none";
}

// 当月の修正回数をカウント（Blob）
async function countThisMonthRevisions(orderId: string): Promise<number> {
  const token = process.env.BLOB_READ_WRITE_TOKEN!;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const result = await list({ prefix: `orders/${orderId}/revision-`, token });
  return result.blobs.filter((b) => new Date(b.uploadedAt) >= monthStart).length;
}

// アップグレード案内メールを送信
async function sendUpgradeMail(toEmail: string, contactName: string, projectName: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const html = `
    <p>${contactName} 様</p>
    <p>「${projectName}」の今月の修正依頼が上限（月2回）に達しました。</p>
    <p>スタンダードプラン（¥4,980/月）にアップグレードすると、修正が無制限になります。</p>
    <p><a href="https://ai-company.dev/pricing">プランのご確認はこちら</a></p>
    <p>引き続きよろしくお願いいたします。<br>Machina</p>
  `;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Machina <noreply@ai-company.dev>",
      to: toEmail,
      subject: `【Machina】修正依頼の上限に達しました — ${projectName}`,
      html,
    }),
  });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = await checkRateLimit(`feedback:${ip}`);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { success: false, error: "リクエストが多すぎます。しばらく待ってから再試行してください。" },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "リクエストの形式が正しくありません。" }, { status: 400 });
  }

  const { orderId, feedback, revisionNo } = body as {
    orderId: string;
    feedback: string;
    revisionNo: number;
  };

  if (!orderId || !feedback) {
    return NextResponse.json({ success: false, error: "必須項目が不足しています。" }, { status: 422 });
  }

  // --- 保守プランによる修正回数チェック（Vercel環境のみ） ---
  if (process.env.VERCEL_ENV) {
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN!;
      const briefResult = await list({ prefix: `orders/${orderId}/brief.md`, token });
      if (briefResult.blobs.length > 0) {
        const briefText = await fetch(briefResult.blobs[0].downloadUrl).then((r) => r.arrayBuffer()).then((buf) => Buffer.from(buf).toString("utf-8"));
        const plan = parsePlan(briefText);

        if (plan === "basic") {
          const count = await countThisMonthRevisions(orderId);
          if (count >= 2) {
            // メールアドレスと名前を brief.md から取得
            const emailMatch = briefText.match(/- メールアドレス: ([^\n]+)/);
            const nameMatch = briefText.match(/- お名前: ([^\n]+)/);
            const titleMatch = briefText.match(/^# 案件依頼: (.+)/m);
            const toEmail = emailMatch?.[1]?.trim() ?? "";
            const contactName = nameMatch?.[1]?.trim() ?? "お客様";
            const projectName = titleMatch?.[1]?.trim() ?? orderId;
            if (toEmail) await sendUpgradeMail(toEmail, contactName, projectName);
            return NextResponse.json(
              {
                success: false,
                error: "今月の修正依頼が上限（月2回）に達しました。スタンダードプランへのアップグレードをご検討ください。",
                upgradeUrl: "https://ai-company.dev/pricing",
              },
              { status: 429 }
            );
          }
        }
      }
    } catch {
      // チェック失敗時は通す（サービス継続優先）
    }
  }

  const rev = revisionNo ?? 1;
  const content = `# 修正依頼 #${rev}: ${orderId}

受付日時: ${new Date().toISOString()}
修正番号: ${rev}

## 修正内容

${feedback}
`;

  try {
    if (process.env.VERCEL_ENV) {
      await put(`orders/${orderId}/revision-${String(rev).padStart(3, "0")}.md`, content, {
        access: "private",
        contentType: "text/markdown",
      });
    } else {
      const fs = await import("fs");
      const path = await import("path");
      const dir = path.join(process.cwd(), "..", "..", "orders", orderId);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, `revision-${String(rev).padStart(3, "0")}.md`),
        content,
        "utf-8"
      );
    }
  } catch (err) {
    console.error("Feedback save error:", err);
    return NextResponse.json({ success: false, error: "保存に失敗しました" }, { status: 500 });
  }

  // 修正依頼受付メールを送信
  try {
    const { list: blobList } = await import("@vercel/blob");
    const { sendRevisionConfirmation } = await import("@/lib/email");
    const token = process.env.BLOB_READ_WRITE_TOKEN!;
    const briefResult = await blobList({ prefix: `orders/${orderId}/brief.md`, token });
    if (briefResult.blobs.length > 0) {
      const briefText = await fetch(briefResult.blobs[0].downloadUrl)
        .then((r) => r.arrayBuffer())
        .then((buf) => Buffer.from(buf).toString("utf-8"));
      const emailMatch = briefText.match(/- メールアドレス: ([^\n]+)/);
      const nameMatch = briefText.match(/- お名前: ([^\n]+)/);
      const titleMatch = briefText.match(/^# 案件依頼: (.+)/m);
      const toEmail = emailMatch?.[1]?.trim() ?? "";
      const contactName = nameMatch?.[1]?.trim() ?? "お客様";
      const projectName = titleMatch?.[1]?.trim() ?? orderId;
      if (toEmail) {
        await sendRevisionConfirmation({
          to: toEmail,
          contactName,
          projectName,
          feedback,
          revisionNo: rev,
          orderId,
        });
      }
    }
  } catch {
    // メール失敗は無視
  }

  // Webhookサーバーに修正依頼トリガーを送信
  try {
    const { triggerWebhook } = await import("@/lib/triggerWebhook");
    triggerWebhook(orderId, "revision.received").catch(() => {});
  } catch {
    // webhook失敗は無視（保存済みなのでcheck-new-ordersが拾う）
  }

  return NextResponse.json({ success: true });
}
