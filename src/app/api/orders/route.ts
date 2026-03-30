import { NextRequest, NextResponse } from "next/server";
import { orderSchema } from "@/lib/validators/order";
import { getStorageAdapter } from "@/lib/storage/adapter";
import { checkRateLimit } from "@/lib/rateLimit";
import { formatDate, slugify } from "@/lib/utils";
import { sendOrderConfirmation, sendOwnerNotification } from "@/lib/email";
import { triggerWebhook } from "@/lib/triggerWebhook";

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
  const slug = slugify(data.projectName) || "untitled";
  const orderId = `${timestamp}-${slug}`;

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

## 希望ドメイン
${data.customDomain && data.customDomain.length > 0 ? data.customDomain : "なし（Vercel URL で納品）"}

## 保守プラン
${data.maintenancePlan === "light" ? "保守プラン（月額 ¥3,000）— ホスティング・修正対応（月2回）・稼働監視" :
  "なし（自分で管理・GitHubとVercelを移管）"}

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

  // 受注確認メール・運営通知・Webhookを並列実行（失敗してもレスポンスには影響しない）
  const adapterForFlag = await getStorageAdapter();
  await Promise.allSettled([
    sendOrderConfirmation({
      to: data.contactEmail,
      contactName: data.contactName,
      projectName: data.projectName,
      orderId,
    }).then(async () => {
      // 送信成功 → Blobにセンチネルを保存（check-new-ordersの再送防止用）
      try {
        await adapterForFlag.saveFile(orderId, ".confirmation-email-sent", new Date().toISOString());
      } catch {}
    }).catch(async (err) => {
      console.error("[api/orders] 受注確認メール送信失敗:", err);
      try { await triggerWebhook(orderId, "email.confirmation_failed"); } catch {}
    }),
    sendOwnerNotification({
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      projectName: data.projectName,
      overview: data.overview,
      orderId,
    }).catch((err) => console.error("[api/orders] 運営通知メール送信失敗 orderId=" + orderId + ":", err)),
    triggerWebhook(orderId, "order.new").catch(() => {}),
  ]);

  return NextResponse.json({ success: true, orderId }, { status: 201 });
}
