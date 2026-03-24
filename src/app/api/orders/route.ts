import { NextRequest, NextResponse } from "next/server";
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
${data.maintenancePlan === "basic" ? "基本プラン（月額 ¥5,000）— ホスティング・SSL・軽微なバグ修正" :
  data.maintenancePlan === "standard" ? "スタンダードプラン（月額 ¥10,000）— 基本 + セキュリティアップデート・月1回改善" :
  data.maintenancePlan === "premium" ? "プレミアムプラン（月額 ¥19,800）— スタンダード + 優先対応・月2回改善" :
  "なし（一括払い・コード移管）"}
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

  // エージェントはcheck-new-orders.shが起動する（支払い確認後に開発開始）
  // Phase1（見積もり・支払いリンク送付）はcronで自動実行される

  return NextResponse.json({ success: true, orderId }, { status: 201 });
}
