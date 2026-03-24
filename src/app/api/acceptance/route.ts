import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { checkRateLimit, isValidOrderId } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = await checkRateLimit(`acceptance:${ip}`);
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
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { orderId, rating, comment } = body as {
    orderId: string;
    rating?: number;
    comment?: string;
  };

  if (!orderId) {
    return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 422 });
  }
  if (!isValidOrderId(orderId)) {
    return NextResponse.json({ success: false, error: "Invalid orderId" }, { status: 422 });
  }

  // orderId の存在確認（なりすまし防止）
  if (process.env.VERCEL_ENV) {
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN!;
      const briefResult = await list({ prefix: `orders/${orderId}/brief.md`, token });
      if (briefResult.blobs.length === 0) {
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
      }
    } catch {
      // チェック失敗時は通す
    }
  }

  const content = `# 検収確認: ${orderId}

受付日時: ${new Date().toISOString()}
ステータス: 検収完了

## 評価
評価: ${rating ?? "-"} / 5
コメント: ${comment?.trim() || "（コメントなし）"}
`;

  try {
    if (process.env.VERCEL_ENV) {
      await put(`orders/${orderId}/acceptance-001.md`, content, {
        access: "private",
        contentType: "text/markdown",
        allowOverwrite: true,
      });
    } else {
      const fs = await import("fs");
      const path = await import("path");
      const dir = path.join(process.cwd(), "..", "..", "orders", orderId);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "acceptance-001.md"), content, "utf-8");
    }
  } catch (err) {
    console.error("Acceptance save error:", err);
    return NextResponse.json({ success: false, error: "保存に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
