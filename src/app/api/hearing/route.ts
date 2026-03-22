import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { orderId, answers } = body as { orderId: string; answers: Record<string, string> };
  if (!orderId || !answers) {
    return NextResponse.json({ success: false, error: "Missing fields" }, { status: 422 });
  }

  const content = `# ヒアリング回答: ${orderId}

受付日時: ${new Date().toISOString()}

${Object.entries(answers).map(([k, v]) => `## ${k}\n${v}`).join("\n\n")}
`;

  try {
    if (process.env.VERCEL_ENV) {
      await put(`orders/${orderId}/hearing.md`, content, {
        access: "private",
        contentType: "text/markdown",
      });
    } else {
      const fs = await import("fs");
      const path = await import("path");
      const dir = path.join(process.cwd(), "..", "..", "orders", orderId);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "hearing.md"), content, "utf-8");
    }
  } catch (err) {
    console.error("Hearing save error:", err);
    return NextResponse.json({ success: false, error: "保存に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
