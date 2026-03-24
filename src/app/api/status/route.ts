import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// =========================================================
// ローカル環境用 (fs ベース)
// =========================================================

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

function getOrdersLocal() {
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

// =========================================================
// Vercel Blob 環境用
// =========================================================

async function fetchBlobText(downloadUrl: string, token: string): Promise<string> {
  const res = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return "";
  return res.text();
}

async function getOrdersFromBlob() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return [];

  const { list } = await import("@vercel/blob");

  // 全 Blob を列挙（ページネーション対応）
  type BlobItem = Awaited<ReturnType<typeof list>>["blobs"][number];
  const blobs: BlobItem[] = [];
  let cursor: string | undefined;
  do {
    const result = await list({ prefix: "orders/", token, limit: 1000, ...(cursor ? { cursor } : {}) });
    blobs.push(...result.blobs);
    cursor = result.cursor;
  } while (cursor);

  // 一意の案件IDを抽出
  const orderIds = [...new Set(
    blobs
      .map(b => b.pathname.split("/")[1])
      .filter(Boolean)
  )].sort();

  const orders = await Promise.all(orderIds.map(async (id) => {
    const idBlobs = blobs.filter(b => b.pathname.startsWith(`orders/${id}/`));

    // brief.md を取得
    const briefBlob = idBlobs.find(b => b.pathname === `orders/${id}/brief.md`);
    let projectName = id;
    let contactName = "不明";
    if (briefBlob) {
      const text = await fetchBlobText(briefBlob.downloadUrl, token).catch(() => "");
      projectName = text.match(/^# 案件依頼: (.+)/m)?.[1] ?? id;
      contactName = text.match(/- お名前: (.+)/m)?.[1] ?? "不明";
    }

    // status-update.md を取得（orchestrator が各フェーズ完了時に書き込む）
    const statusBlob = idBlobs.find(b => b.pathname === `orders/${id}/status-update.md`);
    let step = "⏳ 受付済み";
    let status: "completed" | "processing" | "failed" | "pending" = "pending";

    const hasPayment = idBlobs.some(b => b.pathname === `orders/${id}/payment-received.md`);

    if (statusBlob) {
      const text = await fetchBlobText(statusBlob.downloadUrl, token).catch(() => "");
      const rawLabel = text.match(/^ステータス: (.+)/m)?.[1]?.trim() ?? "";
      if (rawLabel) step = rawLabel;

      if (rawLabel.includes("納品完了")) status = "completed";
      else if (rawLabel.includes("エラー")) status = "failed";
      else if (rawLabel.includes("中") || rawLabel.includes("QA")) status = "processing";
      else if (hasPayment) status = "processing";
    } else if (hasPayment) {
      step = "🔄 開発中";
      status = "processing";
    }

    return {
      id,
      projectName,
      contactName,
      status,
      step,
      steps: [] as { label: string; done: boolean }[],
      elapsedSec: null as number | null,
    };
  }));

  return orders;
}

// =========================================================
// Handler
// =========================================================

export async function GET() {
  if (process.env.VERCEL_ENV) {
    try {
      const orders = await getOrdersFromBlob();
      return NextResponse.json({
        orders,
        logs: [],
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("[api/status] Blob読み取りエラー:", err);
      return NextResponse.json(
        { orders: [], logs: [], updatedAt: new Date().toISOString(), error: "Blob読み取りエラー" },
        { status: 500 }
      );
    }
  }

  // ローカル環境
  return NextResponse.json({
    orders: getOrdersLocal(),
    logs: getRecentLogs(),
    updatedAt: new Date().toISOString(),
  });
}
