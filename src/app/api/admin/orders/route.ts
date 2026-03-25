import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ROOT = path.resolve(process.cwd(), "..", "..");
const ORDERS_DIR = path.join(ROOT, "orders");
const DELIVERABLES_DIR = path.join(ROOT, "deliverables");

function getLocalOrders() {
  if (!fs.existsSync(ORDERS_DIR)) return [];

  return fs.readdirSync(ORDERS_DIR)
    .filter((name) => fs.statSync(path.join(ORDERS_DIR, name)).isDirectory())
    .map((orderId) => {
      const orderDir = path.join(ORDERS_DIR, orderId);
      const briefPath = path.join(orderDir, "brief.md");
      const brief = fs.existsSync(briefPath) ? fs.readFileSync(briefPath, "utf-8") : "";

      const projectName = brief.match(/^# 案件依頼: (.+)/m)?.[1] ?? orderId;
      const contactEmail = brief.match(/^- メール: (.+)/m)?.[1]?.trim() ?? "";
      const contactName = brief.match(/^- 氏名: (.+)/m)?.[1]?.trim() ?? "";
      const createdAt = brief.match(/^- 受付日時: (.+)/m)?.[1]?.trim() ?? "";

      const hasPayment = fs.existsSync(path.join(orderDir, "payment-received.md"));
      const hasDeliverables = fs.existsSync(path.join(DELIVERABLES_DIR, orderId));
      const hasFailed = fs.existsSync(path.join(orderDir, ".failed"));
      const isAwaiting = fs.existsSync(path.join(orderDir, ".awaiting-payment"));
      const isProcessing = fs.existsSync(path.join(orderDir, ".processing"));

      let status = "受付済み";
      if (hasFailed) status = "エラー停止";
      else if (hasDeliverables) status = "納品完了";
      else if (isProcessing) status = "開発中";
      else if (isAwaiting) status = "支払い待ち";
      else if (hasPayment) status = "開発中";

      let deployUrl = "";
      if (hasDeliverables) {
        const handoverPath = path.join(DELIVERABLES_DIR, orderId, "HANDOVER.md");
        if (fs.existsSync(handoverPath)) {
          const m = fs.readFileSync(handoverPath, "utf-8").match(/https:\/\/[^\s)]+\.vercel\.app/);
          if (m) deployUrl = m[0];
        }
      }

      return { orderId, projectName, contactEmail, contactName, createdAt, status, deployUrl };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function getBlobOrders() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return [];

  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: "orders/", token });

  // briefファイルだけ集める
  const briefBlobs = blobs.filter((b) => b.pathname.endsWith("/brief.md"));
  const orders = await Promise.all(
    briefBlobs.map(async (blob) => {
      const orderId = blob.pathname.replace("orders/", "").replace("/brief.md", "");
      let projectName = orderId;
      let contactEmail = "";
      let contactName = "";
      let createdAt = blob.uploadedAt?.toISOString() ?? "";

      try {
        const res = await fetch(blob.downloadUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const text = await res.text();
          projectName = text.match(/^# 案件依頼: (.+)/m)?.[1] ?? orderId;
          contactEmail = text.match(/^- メール: (.+)/m)?.[1]?.trim() ?? "";
          contactName = text.match(/^- 氏名: (.+)/m)?.[1]?.trim() ?? "";
          createdAt = text.match(/^- 受付日時: (.+)/m)?.[1]?.trim() ?? createdAt;
        }
      } catch { /* noop */ }

      const hasPayment = blobs.some((b) => b.pathname === `orders/${orderId}/payment-received.md`);
      const statusBlob = blobs.find((b) => b.pathname === `orders/${orderId}/status-update.md`);
      let status = hasPayment ? "開発中" : "受付済み";
      let deployUrl = "";

      if (statusBlob) {
        try {
          const res = await fetch(statusBlob.downloadUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const text = await res.text();
            const rawLabel = text.match(/^ステータス: (.+)/m)?.[1]?.trim() ?? "";
            const rawDeploy = text.match(/^デプロイURL: (.+)/m)?.[1]?.trim() ?? "";
            if (rawLabel) status = rawLabel;
            if (rawDeploy) deployUrl = rawDeploy;
          }
        } catch { /* noop */ }
      }

      return { orderId, projectName, contactEmail, contactName, createdAt, status, deployUrl };
    })
  );

  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function GET(req: NextRequest) {
  // パスワード認証
  const auth = req.headers.get("x-admin-password");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || auth !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = process.env.VERCEL_ENV
      ? await getBlobOrders()
      : getLocalOrders();
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[admin/orders] エラー:", err);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
