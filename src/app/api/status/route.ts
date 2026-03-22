import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), "..", "..");
const ORDERS_DIR = path.join(ROOT, "orders");
const LOGS_DIR = path.join(ROOT, "logs");
const DELIVERABLES_DIR = path.join(ROOT, "deliverables");
const SPECS_DIR = path.join(ROOT, "specs");
const DESIGNS_DIR = path.join(ROOT, "designs");
const SRC_DIR = path.join(ROOT, "src");

function countFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const walk = (d: string) => {
    for (const f of fs.readdirSync(d)) {
      const full = path.join(d, f);
      if (f === "node_modules" || f === ".next") continue;
      if (fs.statSync(full).isDirectory()) walk(full);
      else count++;
    }
  };
  walk(dir);
  return count;
}

function getAgentSteps(orderId: string) {
  const orderDir = path.join(ORDERS_DIR, orderId);
  const srcDir = path.join(SRC_DIR, orderId);
  const specsDir = path.join(SPECS_DIR, orderId);
  const designsDir = path.join(DESIGNS_DIR, orderId);
  const deliverablesDir = path.join(DELIVERABLES_DIR, orderId);

  const hasSales = fs.existsSync(path.join(orderDir, "sales-analysis.md"));
  const hasSpecs = fs.existsSync(specsDir) && fs.readdirSync(specsDir).length > 0;
  const hasDesigns = fs.existsSync(designsDir) && fs.readdirSync(designsDir).length > 0;
  const hasSrc = fs.existsSync(srcDir) && fs.readdirSync(srcDir).filter(f => f !== "node_modules").length > 0;
  const srcFileCount = hasSrc ? countFiles(srcDir) : 0;
  const hasTests = hasSrc && (
    fs.existsSync(path.join(srcDir, "__tests__")) ||
    fs.existsSync(path.join(srcDir, "tests")) ||
    fs.existsSync(path.join(srcDir, "src", "__tests__"))
  );
  const hasDeliverables = fs.existsSync(deliverablesDir);
  const hasFailed = fs.existsSync(path.join(orderDir, ".failed"));

  const steps = [
    { label: "受注", done: true },
    { label: "見積", done: hasSales },
    { label: "要件定義", done: hasSpecs, detail: hasSpecs ? `${fs.readdirSync(specsDir).length}ファイル` : undefined },
    { label: "設計", done: hasDesigns, detail: hasDesigns ? `${fs.readdirSync(designsDir).length}ファイル` : undefined },
    { label: "実装", done: hasDeliverables || hasTests, active: hasSrc && !hasTests && !hasDeliverables, detail: hasSrc ? `${srcFileCount}ファイル作成済み` : undefined },
    { label: "QA・レビュー", done: hasDeliverables, active: hasTests && !hasDeliverables },
    { label: "納品", done: hasDeliverables },
  ];

  const currentLabel = hasFailed ? "❌ エラー停止"
    : hasDeliverables ? "✅ 納品完了"
    : hasTests ? "🔍 QA・レビュー中"
    : hasSrc ? `💻 実装中 (${srcFileCount}ファイル)`
    : hasDesigns ? "🏗 設計完了"
    : hasSpecs ? "📐 要件定義完了"
    : hasSales ? "📋 見積完了"
    : "⏳ 受付済み";

  return { steps, currentLabel };
}

function getOrderStatus(orderId: string): "completed" | "processing" | "failed" | "pending" {
  if (fs.existsSync(path.join(DELIVERABLES_DIR, orderId))) return "completed";
  if (fs.existsSync(path.join(ORDERS_DIR, orderId, ".failed"))) return "failed";
  if (fs.existsSync(path.join(ORDERS_DIR, orderId, ".processing"))) return "processing";
  return "pending";
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
      const { steps, currentLabel } = getAgentSteps(id);
      const processingPath = path.join(ORDERS_DIR, id, ".processing");
      const elapsedSec = status === "processing" && fs.existsSync(processingPath)
        ? Math.floor((Date.now() - fs.statSync(processingPath).mtimeMs) / 1000)
        : null;
      return { id, projectName, contactName, status, step: currentLabel, steps, elapsedSec };
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
