import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { checkRateLimit } from "@/lib/rateLimit";
import { triggerWebhook } from "@/lib/triggerWebhook";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = await checkRateLimit(`hearing:${ip}`);
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

  const { orderId, answers, round } = body as {
    orderId: string;
    answers: Record<string, string>;
    round?: number;
  };

  if (!orderId || !answers) {
    return NextResponse.json({ success: false, error: "必須項目が不足しています。" }, { status: 422 });
  }

  const rev = round ?? 1;
  const filename = `hearing-${String(rev).padStart(3, "0")}.md`;
  const content = `# ヒアリング回答 第${rev}回: ${orderId}

受付日時: ${new Date().toISOString()}

${Object.entries(answers).map(([k, v]) => `## ${k}\n${v || "（未回答）"}`).join("\n\n")}
`;

  try {
    if (process.env.VERCEL_ENV) {
      await put(`orders/${orderId}/${filename}`, content, {
        access: "private",
        contentType: "text/markdown",
        allowOverwrite: true,
      });
    } else {
      const fs = await import("fs");
      const path = await import("path");
      const dir = path.join(process.cwd(), "..", "..", "orders", orderId);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, filename), content, "utf-8");
    }
  } catch (err) {
    console.error("Hearing save error:", err);
    return NextResponse.json({ success: false, error: "保存に失敗しました" }, { status: 500 });
  }

  // Webhookサーバーに即時通知
  triggerWebhook(orderId, "hearing.answered").catch(() => {});

  return NextResponse.json({ success: true });
}
