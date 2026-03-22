import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { orderId, feedback, revisionNo } = body as {
    orderId: string;
    feedback: string;
    revisionNo: number;
  };

  if (!orderId || !feedback) {
    return NextResponse.json({ success: false, error: "Missing fields" }, { status: 422 });
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

  return NextResponse.json({ success: true });
}
