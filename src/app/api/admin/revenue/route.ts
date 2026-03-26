import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ROOT = path.resolve(process.cwd(), "..", "..");
const ORDERS_DIR = path.join(ROOT, "orders");
const DELIVERABLES_DIR = path.join(ROOT, "deliverables");

type OrderRevenue = {
  orderId: string;
  projectName: string;
  amount: number;
  status: string;
  deliveredAt: string;
  createdAt: string;
  revisionCount: number;
};

function parseAmount(text: string): number | null {
  // "予算: 25万円" 形式
  const manMatch = text.match(/予算[：:]\s*(\d+)万円/);
  if (manMatch) return parseInt(manMatch[1]) * 10000;

  // "見積もり金額: ¥150,000" 形式
  const yenMatch = text.match(/見積もり金額[：:]\s*¥?([\d,]+)/);
  if (yenMatch) return parseInt(yenMatch[1].replace(/,/g, ""));

  // "¥150,000" 単体
  const rawYen = text.match(/¥([\d,]+)/);
  if (rawYen) {
    const val = parseInt(rawYen[1].replace(/,/g, ""));
    // 月額プランの小額は除外（1万円以下はスキップ）
    if (val > 10000) return val;
  }

  return null;
}

function getOrderData(): OrderRevenue[] {
  if (!fs.existsSync(ORDERS_DIR)) return [];

  const orderIds = fs
    .readdirSync(ORDERS_DIR)
    .filter((name) => {
      const fullPath = path.join(ORDERS_DIR, name);
      return fs.statSync(fullPath).isDirectory();
    });

  const results: OrderRevenue[] = [];

  for (const orderId of orderIds) {
    try {
      const orderDir = path.join(ORDERS_DIR, orderId);
      const briefPath = path.join(orderDir, "brief.md");
      const brief = fs.existsSync(briefPath)
        ? fs.readFileSync(briefPath, "utf-8")
        : "";

      const projectName =
        brief.match(/^# 案件依頼: (.+)/m)?.[1] ?? orderId;
      const createdAt =
        brief.match(/^- 受付日時: (.+)/m)?.[1]?.trim() ?? "";

      // 金額解析
      let amount = parseAmount(brief) ?? 50000;

      // analysis.mdにフォールバック
      if (amount === 50000) {
        const analysisPath = path.join(orderDir, "analysis.md");
        if (fs.existsSync(analysisPath)) {
          const analysisText = fs.readFileSync(analysisPath, "utf-8");
          const analysisAmount = parseAmount(analysisText);
          if (analysisAmount !== null) amount = analysisAmount;
        }
      }

      // ステータス判定
      const hasDeliverables = fs.existsSync(
        path.join(DELIVERABLES_DIR, orderId)
      );
      const hasFailed = fs.existsSync(path.join(orderDir, ".failed"));
      const isAwaiting = fs.existsSync(
        path.join(orderDir, ".awaiting-payment")
      );
      const isProcessing = fs.existsSync(path.join(orderDir, ".processing"));
      const hasPayment = fs.existsSync(
        path.join(orderDir, "payment-received.md")
      );

      let status = "received";
      if (hasFailed) status = "failed";
      else if (hasDeliverables) status = "delivered";
      else if (isProcessing) status = "processing";
      else if (isAwaiting) status = "awaiting_payment";
      else if (hasPayment) status = "processing";

      // 納品日（HANDOVER.mdの更新日時 or deliverables dirの更新日時）
      let deliveredAt = "";
      if (hasDeliverables) {
        const delDir = path.join(DELIVERABLES_DIR, orderId);
        const handoverPath = path.join(delDir, "HANDOVER.md");
        if (fs.existsSync(handoverPath)) {
          const stat = fs.statSync(handoverPath);
          deliveredAt = stat.mtime.toISOString().split("T")[0];
        } else {
          const stat = fs.statSync(delDir);
          deliveredAt = stat.mtime.toISOString().split("T")[0];
        }
      }

      // リビジョン数
      const files = fs.readdirSync(orderDir);
      const revisionCount = files.filter((f) =>
        f.match(/^revision-\d+\.md$/)
      ).length;

      results.push({
        orderId,
        projectName,
        amount,
        status,
        deliveredAt,
        createdAt,
        revisionCount,
      });
    } catch {
      // ファイルが読めない案件はスキップ
      continue;
    }
  }

  return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function buildMonthlyData(orders: OrderRevenue[]) {
  const monthMap: Record<
    string,
    { revenue: number; orders: number }
  > = {};

  for (const order of orders) {
    if (order.status !== "delivered") continue;
    const date = order.deliveredAt || order.createdAt;
    if (!date) continue;
    const month = date.slice(0, 7); // "2026-03"
    if (!monthMap[month]) monthMap[month] = { revenue: 0, orders: 0 };
    monthMap[month].revenue += order.amount;
    monthMap[month].orders += 1;
  }

  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders,
      avgPrice: data.orders > 0 ? Math.round(data.revenue / data.orders) : 0,
    }));
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || auth !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = getOrderData();

    // 月次データ
    const monthly = buildMonthlyData(orders);

    // トータル集計
    const allOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const avgPrice = allOrders > 0 ? Math.round(totalRevenue / allOrders) : 0;
    const ordersWithRevision = orders.filter((o) => o.revisionCount > 0).length;
    const revisionRate =
      allOrders > 0
        ? Math.round((ordersWithRevision / allOrders) * 100) / 100
        : 0;

    // 最近の案件（直近10件）
    const recentOrders = orders.slice(0, 10).map((o) => ({
      orderId: o.orderId,
      projectName: o.projectName,
      amount: o.amount,
      status: o.status,
      deliveredAt: o.deliveredAt,
    }));

    return NextResponse.json({
      monthly,
      total: {
        revenue: totalRevenue,
        orders: allOrders,
        avgPrice,
        revisionRate,
      },
      recentOrders,
    });
  } catch (err) {
    console.error("[admin/revenue] エラー:", err);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
