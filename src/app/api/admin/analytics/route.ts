import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ROOT = path.resolve(process.cwd(), "..", "..");
const ORDERS_DIR = path.join(ROOT, "orders");
const DELIVERABLES_DIR = path.join(ROOT, "deliverables");
const SPECS_DIR = path.join(ROOT, "specs");

function getLocalAnalytics() {
  if (!fs.existsSync(ORDERS_DIR)) {
    return { monthlyOrders: [], funnel: {}, avgDeliveryDays: null, revisionRate: 0, topStatuses: [] };
  }

  const orderDirs = fs.readdirSync(ORDERS_DIR)
    .filter((name) => fs.statSync(path.join(ORDERS_DIR, name)).isDirectory())
    .filter((name) => !name.startsWith("test-"));

  const orders = orderDirs.map((orderId) => {
    const orderDir = path.join(ORDERS_DIR, orderId);
    const briefPath = path.join(orderDir, "brief.md");
    const brief = fs.existsSync(briefPath) ? fs.readFileSync(briefPath, "utf-8") : "";

    const createdAt = brief.match(/^- 受付日時: (.+)/m)?.[1]?.trim() ?? "";
    const hasPayment = fs.existsSync(path.join(orderDir, "payment-received.md"));
    const hasDeliverables = fs.existsSync(path.join(DELIVERABLES_DIR, orderId));
    const hasFailed = fs.existsSync(path.join(orderDir, ".failed"));
    const isAwaiting = fs.existsSync(path.join(orderDir, ".awaiting-payment"));
    const hasHearing = fs.existsSync(path.join(orderDir, "hearing-complete.md")) ||
      fs.readdirSync(orderDir).some((f) => f.startsWith("hearing-") && !f.startsWith("hearing-questions-"));
    const hasSpecs = fs.existsSync(path.join(SPECS_DIR, orderId));

    // 修正依頼数
    const revCount = fs.readdirSync(orderDir).filter((f) => /^revision-\d{3}\.md$/.test(f)).length;

    // 納品日時（deliverables README のタイムスタンプ）
    let deliveredAt: string | null = null;
    if (hasDeliverables) {
      const readme = path.join(DELIVERABLES_DIR, orderId, "README.md");
      if (fs.existsSync(readme)) {
        deliveredAt = new Date(fs.statSync(readme).mtime).toISOString();
      }
    }

    return { orderId, createdAt, hasPayment, hasDeliverables, hasFailed, isAwaiting, hasHearing, hasSpecs, revCount, deliveredAt };
  });

  // 月別受注数（直近12ヶ月）
  const now = new Date();
  const monthlyMap: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = 0;
  }
  for (const o of orders) {
    if (!o.createdAt) continue;
    const d = new Date(o.createdAt.replace(/T/, " ").replace(/\+.*/, ""));
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthlyMap) monthlyMap[key]++;
  }
  const monthlyOrders = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

  // コンバージョンファネル
  const total = orders.length;
  const heard = orders.filter((o) => o.hasHearing).length;
  const paid = orders.filter((o) => o.hasPayment).length;
  const specd = orders.filter((o) => o.hasSpecs).length;
  const delivered = orders.filter((o) => o.hasDeliverables).length;
  const funnel = { total, heard, paid, specd, delivered };

  // 平均納品日数
  const deliveryDays: number[] = [];
  for (const o of orders) {
    if (!o.createdAt || !o.deliveredAt) continue;
    const created = new Date(o.createdAt.replace(/T/, " ").replace(/\+.*/, ""));
    const deliveredDate = new Date(o.deliveredAt);
    if (isNaN(created.getTime()) || isNaN(deliveredDate.getTime())) continue;
    const days = (deliveredDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (days > 0 && days < 365) deliveryDays.push(days);
  }
  const avgDeliveryDays = deliveryDays.length > 0
    ? Math.round(deliveryDays.reduce((a, b) => a + b, 0) / deliveryDays.length * 10) / 10
    : null;

  // 修正依頼率（納品済みのうち修正依頼があった件数）
  const deliveredOrders = orders.filter((o) => o.hasDeliverables);
  const withRevision = deliveredOrders.filter((o) => o.revCount > 0).length;
  const revisionRate = deliveredOrders.length > 0
    ? Math.round((withRevision / deliveredOrders.length) * 100)
    : 0;

  // ステータス集計
  const statusMap: Record<string, number> = {};
  for (const o of orders) {
    let s = "受付済み";
    if (o.hasFailed) s = "エラー停止";
    else if (o.hasDeliverables) s = "納品完了";
    else if (o.isAwaiting) s = "支払い待ち";
    else if (o.hasPayment) s = "開発中";
    statusMap[s] = (statusMap[s] ?? 0) + 1;
  }
  const topStatuses = Object.entries(statusMap)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({ status, count }));

  return { monthlyOrders, funnel, avgDeliveryDays, revisionRate, topStatuses };
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || auth !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Vercel Blob環境では簡易版を返す（orders APIで取得済みデータから集計）
    if (process.env.VERCEL_ENV) {
      return NextResponse.json({ error: "Blob環境では未対応 — ローカルのみ" }, { status: 501 });
    }
    const data = getLocalAnalytics();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[admin/analytics] エラー:", err);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
