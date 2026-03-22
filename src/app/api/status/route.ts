import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), "..", "..");
const ORDERS_DIR = path.join(ROOT, "orders");
const LOGS_DIR = path.join(ROOT, "logs");
const DELIVERABLES_DIR = path.join(ROOT, "deliverables");

const SPECS_DIR = path.join(ROOT, "specs");
const DESIGNS_DIR = path.join(ROOT, "designs");

function getOrderStatus(orderId: string): "completed" | "processing" | "failed" | "pending" {
  if (fs.existsSync(path.join(DELIVERABLES_DIR, orderId))) return "completed";
  if (fs.existsSync(path.join(ORDERS_DIR, orderId, ".failed"))) return "failed";
  if (fs.existsSync(path.join(ORDERS_DIR, orderId, ".processing"))) return "processing";
  return "pending";
}

function getCurrentStep(orderId: string): string {
  if (fs.existsSync(path.join(DELIVERABLES_DIR, orderId))) return "✅ 納品完了";
  if (fs.existsSync(path.join(ORDERS_DIR, orderId, ".failed"))) return "❌ エラー停止";

  const srcDir = path.join(ROOT, "src", orderId);
  const hasSrc = fs.existsSync(srcDir) && fs.readdirSync(srcDir).length > 0;
  if (hasSrc) {
    const hasTests = fs.existsSync(path.join(srcDir, "__tests__")) || fs.existsSync(path.join(srcDir, "tests"));
    if (hasTests) return "🔍 QA・レビュー中";
    return "💻 実装中";
  }

  if (fs.existsSync(path.join(DESIGNS_DIR, orderId))) return "🏗 設計完了 → 実装待ち";
  if (fs.existsSync(path.join(SPECS_DIR, orderId))) return "📐 要件定義完了 → 設計待ち";

  const hasContract = fs.existsSync(path.join(ORDERS_DIR, orderId, "sales-analysis.md"));
  if (hasContract) return "📋 見積完了 → 開発待ち";

  return "⏳ 受付済み";
}

function getOrders() {
  if (!fs.existsSync(ORDERS_DIR)) return [];
  return fs.readdirSync(ORDERS_DIR)
    .filter(id => fs.statSync(path.join(ORDERS_DIR, id)).isDirectory())
    .map(id => {
      const briefPath = path.join(ORDERS_DIR, id, "brief.md");
      const brief = fs.existsSync(briefPath) ? fs.readFileSync(briefPath, "utf-8") : "";
      const projectName = brief.match(/^# 案件依頼: (.+)/m)?.[1] ?? id;
      const contactName = brief.match(/- お名前: (.+)/m)?.[1] ?? "不明";
      const status = getOrderStatus(id);
      const step = getCurrentStep(id);
      const processingPath = path.join(ORDERS_DIR, id, ".processing");
      const elapsedSec = status === "processing" && fs.existsSync(processingPath)
        ? Math.floor((Date.now() - fs.statSync(processingPath).mtimeMs) / 1000)
        : null;
      return { id, projectName, contactName, status, step, elapsedSec };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function getRecentLogs(): string[] {
  const today = new Date().toISOString().slice(0, 10);
  const logPath = path.join(LOGS_DIR, `agent-${today}.log`);
  if (!fs.existsSync(logPath)) return [];
  const lines = fs.readFileSync(logPath, "utf-8").split("\n").filter(Boolean);
  return lines.slice(-30);
}

export async function GET() {
  return NextResponse.json({
    orders: getOrders(),
    logs: getRecentLogs(),
    updatedAt: new Date().toISOString(),
  });
}
