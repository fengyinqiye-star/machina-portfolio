import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifyToken(orderId: string, token: string): boolean {
  try {
    const secret = process.env.WEBHOOK_SECRET || "machina-secret";
    const expected = crypto.createHmac("sha256", secret).update(orderId).digest("hex");
    const tokenBuf = Buffer.from(token, "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    if (tokenBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
}

async function notifyWebhook(orderId: string, event: string, note?: string) {
  const webhookUrl = process.env.WEBHOOK_URL;
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) return;

  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${webhookSecret}`,
    },
    body: JSON.stringify({ orderId, event, note }),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;

  if (!orderId || !/^[a-zA-Z0-9_\-.]{1,80}$/.test(orderId) || orderId.includes("..")) {
    return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { token, action, note } = body as { token: string; action: string; note?: string };

  if (!token || !verifyToken(orderId, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
  }

  const event = action === "approve" ? "owner.approved" : "owner.rejected";
  await notifyWebhook(orderId, event, note);

  return NextResponse.json({ ok: true, action });
}
