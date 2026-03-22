import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { orderSchema } from "@/lib/validators/order";
import { getStorageAdapter } from "@/lib/storage/adapter";
import { checkRateLimit } from "@/lib/rateLimit";
import { formatDate, slugify } from "@/lib/utils";
import { sendOrderConfirmation, sendOwnerNotification } from "@/lib/email";

export async function POST(request: NextRequest) {
  // レートリミット
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = await checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { success: false, error: "リクエストが多すぎます。しばらく待ってから再試行してください。" },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter) } }
    );
  }

  // パース
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "リクエストの形式が正しくありません。" },
      { status: 400 }
    );
  }

  // バリデーション
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "入力内容に誤りがあります。", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { honeypot, ...data } = parsed.data;

  // ハニーポットチェック
  if (honeypot && honeypot.length > 0) {
    return NextResponse.json({ success: true, orderId: "dummy" }, { status: 200 });
  }

  // 保存
  const timestamp = formatDate(new Date());
  const orderId = `${timestamp}-${slugify(data.projectName)}`;

  const content = `# 案件依頼: ${data.projectName}

## 受付情報
- 受付日時: ${new Date().toISOString()}
- 案件ID: ${orderId}

## 依頼者情報
- お名前: ${data.contactName}
- メールアドレス: ${data.contactEmail}

## 案件概要
${data.overview}

## 技術要望
${data.techRequirements ?? "特に指定なし"}
`;

  try {
    const adapter = await getStorageAdapter();
    await adapter.saveOrder(orderId, content);
  } catch (err) {
    console.error("Storage error:", err);
    return NextResponse.json(
      { success: false, error: "保存処理でエラーが発生しました。" },
      { status: 500 }
    );
  }

  // 受注確認メール送信（非同期、失敗しても続行）
  sendOrderConfirmation({
    to: data.contactEmail,
    contactName: data.contactName,
    projectName: data.projectName,
    orderId,
  }).catch((err) => console.error("[api/orders] 受注確認メール送信失敗:", err));

  // 運営への通知メール
  sendOwnerNotification({
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    projectName: data.projectName,
    overview: data.overview,
    orderId,
  }).catch((err) => console.error("[api/orders] 運営通知メール送信失敗:", err));

  // エージェントをバックグラウンドで起動（応答は待たない）
  try {
    const triggerScript = path.resolve(process.cwd(), "..", "..", "..", "scripts", "trigger-order.sh");
    const agent = spawn("bash", [triggerScript, orderId], {
      detached: true,
      stdio: "ignore",
      cwd: path.resolve(process.cwd(), "..", "..", ".."),
    });
    agent.unref();
  } catch (err) {
    console.error("[api/orders] エージェント起動失敗（案件は保存済み）:", err);
  }

  return NextResponse.json({ success: true, orderId }, { status: 201 });
}
