import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { checkRateLimit, isValidOrderId } from "@/lib/rateLimit";

// brief.md から保守プランを解析
function parsePlan(content: string): "none" | "light" | "standard" | "premium" {
  const match = content.match(/## 保守プラン\n([^\n]+)/);
  if (!match) return "none";
  const line = match[1];
  if (line.includes("プレミアム")) return "premium";
  if (line.includes("スタンダード")) return "standard";
  if (line.includes("ライト") || line.includes("基本")) return "light";
  return "none";
}

// 当月の修正回数をカウント（Blob）
async function countThisMonthRevisions(orderId: string): Promise<number> {
  if (!process.env.VERCEL_ENV) return 0;
  const token = process.env.BLOB_READ_WRITE_TOKEN!;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const result = await list({ prefix: `orders/${orderId}/revision-`, token });
  return result.blobs.filter((b) => new Date(b.uploadedAt) >= monthStart).length;
}

// brief.md から顧客情報を取得
async function getBriefInfo(orderId: string): Promise<{ toEmail: string; contactName: string; projectName: string; plan: "none" | "light" | "standard" | "premium" } | null> {
  if (!process.env.VERCEL_ENV) return null;
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN!;
    const briefResult = await list({ prefix: `orders/${orderId}/brief.md`, token });
    if (briefResult.blobs.length === 0) return null;
    // プライベート Blob は Authorization ヘッダーが必要
    const briefText = await fetch(briefResult.blobs[0].url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.arrayBuffer())
      .then((buf) => Buffer.from(buf).toString("utf-8"));
    return {
      toEmail: briefText.match(/- メールアドレス: ([^\n]+)/)?.[1]?.trim() ?? "",
      contactName: briefText.match(/- お名前: ([^\n]+)/)?.[1]?.trim() ?? "お客様",
      projectName: briefText.match(/^# 案件依頼: (.+)/m)?.[1]?.trim() ?? orderId,
      plan: parsePlan(briefText),
    };
  } catch {
    return null;
  }
}

// アップグレード案内メールを送信
async function sendUpgradeMail(toEmail: string, contactName: string, projectName: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Machina <noreply@ai-company.dev>",
      to: toEmail,
      subject: `【Machina】修正依頼の上限に達しました — ${projectName}`,
      html: `
        <p>${contactName} 様</p>
        <p>「${projectName}」の今月の修正依頼が上限（月2回）に達しました。</p>
        <p>スタンダードプラン（¥4,980/月）にアップグレードすると、修正が無制限になります。</p>
        <p><a href="https://ai-company.dev/pricing">プランのご確認はこちら</a></p>
        <p>引き続きよろしくお願いいたします。<br>Machina</p>
      `,
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

  const { orderId, feedback } = body as {
    orderId: string;
    feedback: string;
    revisionNo?: number;
  };

  if (!orderId || !feedback) {
    return NextResponse.json({ success: false, error: "必須項目が不足しています。" }, { status: 422 });
  }
  if (!isValidOrderId(orderId)) {
    return NextResponse.json({ success: false, error: "無効な案件IDです。" }, { status: 422 });
  }

  // 既存revision数を数えて次番号を決定（クライアント送信値は使わない）
  let rev = 1;
  let existingRevCount = 0;
  try {
    if (process.env.VERCEL_ENV) {
      const token = process.env.BLOB_READ_WRITE_TOKEN!;
      const existing = await list({ prefix: `orders/${orderId}/revision-`, token });
      existingRevCount = existing.blobs.length;
    } else {
      // ローカル環境: ファイルシステムから既存数をカウント
      const { default: fs } = await import("fs");
      const { default: path } = await import("path");
      const dir = path.join(process.cwd(), "..", "..", "orders", orderId);
      if (fs.existsSync(dir)) {
        existingRevCount = fs.readdirSync(dir).filter(f => /^revision-\d+\.md$/.test(f)).length;
      }
    }
    rev = existingRevCount + 1;
  } catch {
    // 取得失敗時はフォールバック（保存は続行）
  }

  // --- Step 1: brief.md から顧客情報・プランを取得（保存前にプラン制限チェック） ---
  const briefInfo = await getBriefInfo(orderId);

  // --- Step 2: 保守プランによる修正回数チェック（保存前に実施してBlobへの余分な書き込みを防ぐ） ---
  if (briefInfo?.plan === "light") {
    try {
      const thisMonthCount = await countThisMonthRevisions(orderId);
      if (thisMonthCount >= 2) {
        if (briefInfo.toEmail) {
          sendUpgradeMail(briefInfo.toEmail, briefInfo.contactName, briefInfo.projectName).catch(() => {});
        }
        return NextResponse.json(
          {
            success: false,
            error: "今月の修正依頼が上限（月2回）に達しました。スタンダードプランへのアップグレードをご検討ください。",
            upgradeUrl: "https://ai-company.dev/pricing",
          },
          { status: 429 }
        );
      }
    } catch {
      // チェック失敗時は通す（サービス継続優先）
    }
  }

  const content = `# 修正依頼 #${rev}: ${orderId}

受付日時: ${new Date().toISOString()}
修正番号: ${rev}

## 修正内容

${feedback}
`;

  // --- Step 3: 保存 ---
  try {
    if (process.env.VERCEL_ENV) {
      await put(`orders/${orderId}/revision-${String(rev).padStart(3, "0")}.md`, content, {
        access: "private",
        contentType: "text/markdown",
        allowOverwrite: true,
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

  // --- Step 4: 受付確認メールを送信 ---
  if (briefInfo?.toEmail) {
    try {
      const { sendRevisionConfirmation } = await import("@/lib/email");
      await sendRevisionConfirmation({
        to: briefInfo.toEmail,
        contactName: briefInfo.contactName,
        projectName: briefInfo.projectName,
        feedback,
        revisionNo: rev,
        orderId,
      });
    } catch {
      // メール失敗は無視
    }
  }

  // --- Step 5: Webhookサーバーに修正依頼トリガーを送信 ---
  try {
    const { triggerWebhook } = await import("@/lib/triggerWebhook");
    triggerWebhook(orderId, "revision.received").catch(() => {});
  } catch {
    // webhook失敗は無視（保存済みなのでcheck-new-ordersが拾う）
  }

  return NextResponse.json({ success: true });
}
