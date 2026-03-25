import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ROOT = path.resolve(process.cwd(), "..", "..");
const ORDERS_DIR = path.join(ROOT, "orders");
const DELIVERABLES_DIR = path.join(ROOT, "deliverables");

const schema = z.object({
  email: z.string().email(),
});

function getLocalOrdersByEmail(email: string) {
  if (!fs.existsSync(ORDERS_DIR)) return [];

  return fs.readdirSync(ORDERS_DIR)
    .filter((name) => fs.statSync(path.join(ORDERS_DIR, name)).isDirectory())
    .flatMap((orderId) => {
      const orderDir = path.join(ORDERS_DIR, orderId);
      const briefPath = path.join(orderDir, "brief.md");
      if (!fs.existsSync(briefPath)) return [];
      const brief = fs.readFileSync(briefPath, "utf-8");

      const orderEmail = brief.match(/^- メールアドレス: (.+)/m)?.[1]?.trim() ?? brief.match(/^- メール: (.+)/m)?.[1]?.trim() ?? "";
      if (orderEmail.toLowerCase() !== email.toLowerCase()) return [];

      const projectName = brief.match(/^# 案件依頼: (.+)/m)?.[1] ?? orderId;
      const createdAt = brief.match(/^- 受付日時: (.+)/m)?.[1]?.trim() ?? "";
      const hasDeliverables = fs.existsSync(path.join(DELIVERABLES_DIR, orderId));
      const hasPayment = fs.existsSync(path.join(orderDir, "payment-received.md"));
      const hasFailed = fs.existsSync(path.join(orderDir, ".failed"));
      const isAwaiting = fs.existsSync(path.join(orderDir, ".awaiting-payment"));

      let status = "受付済み";
      if (hasFailed) status = "エラー停止";
      else if (hasDeliverables) status = "納品完了";
      else if (hasPayment) status = "開発中";
      else if (isAwaiting) status = "支払い待ち";

      let deployUrl = "";
      if (hasDeliverables) {
        const handoverPath = path.join(DELIVERABLES_DIR, orderId, "HANDOVER.md");
        if (fs.existsSync(handoverPath)) {
          const m = fs.readFileSync(handoverPath, "utf-8").match(/https:\/\/[^\s)]+\.vercel\.app/);
          if (m) deployUrl = m[0];
        }
      }

      return [{ orderId, projectName, createdAt, status, deployUrl }];
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function getBlobOrdersByEmail(email: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return [];

  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: "orders/", token });

  const briefBlobs = blobs.filter((b) => b.pathname.endsWith("/brief.md"));

  const results = await Promise.all(
    briefBlobs.map(async (blob) => {
      const orderId = blob.pathname.replace("orders/", "").replace("/brief.md", "");
      try {
        const res = await fetch(blob.downloadUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return null;
        const text = await res.text();
        const orderEmail = text.match(/^- メールアドレス: (.+)/m)?.[1]?.trim() ?? text.match(/^- メール: (.+)/m)?.[1]?.trim() ?? "";
        if (orderEmail.toLowerCase() !== email.toLowerCase()) return null;

        const projectName = text.match(/^# 案件依頼: (.+)/m)?.[1] ?? orderId;
        const createdAt = text.match(/^- 受付日時: (.+)/m)?.[1]?.trim() ?? blob.uploadedAt?.toISOString() ?? "";

        const hasPayment = blobs.some((b) => b.pathname === `orders/${orderId}/payment-received.md`);
        const statusBlob = blobs.find((b) => b.pathname === `orders/${orderId}/status-update.md`);
        let status = hasPayment ? "開発中" : "受付済み";
        let deployUrl = "";

        if (statusBlob) {
          const sres = await fetch(statusBlob.downloadUrl, { headers: { Authorization: `Bearer ${token}` } });
          if (sres.ok) {
            const stext = await sres.text();
            const rawLabel = stext.match(/^ステータス: (.+)/m)?.[1]?.trim() ?? "";
            const rawDeploy = stext.match(/^デプロイURL: (.+)/m)?.[1]?.trim() ?? "";
            if (rawLabel) status = rawLabel;
            if (rawDeploy) deployUrl = rawDeploy;
          }
        }

        return { orderId, projectName, createdAt, status, deployUrl };
      } catch { return null; }
    })
  );

  return results.filter(Boolean).sort((a, b) => (b?.createdAt ?? "").localeCompare(a?.createdAt ?? "")) as typeof results[0][];
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "形式が正しくありません" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 422 });
  }

  const { email } = parsed.data;

  try {
    const orders = process.env.VERCEL_ENV
      ? await getBlobOrdersByEmail(email)
      : getLocalOrdersByEmail(email);
    // 存在しなくてもエラーにしない（メールアドレス枚挙を防ぐため件数は返さない）
    return NextResponse.json({ orders: orders ?? [] });
  } catch (err) {
    console.error("[dashboard/orders] エラー:", err);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
