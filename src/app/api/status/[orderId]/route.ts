import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// =========================================================
// ローカル環境用 (fs ベース)
// =========================================================

const ROOT = path.resolve(process.cwd(), "..", "..");
const ORDERS_DIR = path.join(ROOT, "orders");
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

function getOrderStatusLocal(orderId: string) {
  const orderDir = path.join(ORDERS_DIR, orderId);

  if (!fs.existsSync(orderDir)) return null;

  const briefPath = path.join(orderDir, "brief.md");
  const brief = fs.existsSync(briefPath) ? fs.readFileSync(briefPath, "utf-8") : "";
  const projectName = brief.match(/^# 案件依頼: (.+)/m)?.[1] ?? orderId;

  const srcDir = path.join(SRC_DIR, orderId);
  const specsDir = path.join(SPECS_DIR, orderId);
  const designsDir = path.join(DESIGNS_DIR, orderId);
  const deliverablesDir = path.join(DELIVERABLES_DIR, orderId);

  const hasSales      = fs.existsSync(path.join(orderDir, "sales-analysis.md")) || fs.existsSync(path.join(orderDir, "analysis.md"));
  const hasPayment    = fs.existsSync(path.join(orderDir, "payment-received.md"));
  const hasSpecs      = fs.existsSync(specsDir) && fs.readdirSync(specsDir).length > 0;
  const hasDesigns    = fs.existsSync(designsDir) && fs.readdirSync(designsDir).length > 0;
  const hasSrc        = fs.existsSync(srcDir) && fs.readdirSync(srcDir).filter(f => f !== "node_modules").length > 0;
  const srcFileCount  = hasSrc ? countFiles(srcDir) : 0;
  const hasTests      = hasSrc && (
    fs.existsSync(path.join(srcDir, "__tests__")) ||
    fs.existsSync(path.join(srcDir, "tests")) ||
    fs.existsSync(path.join(srcDir, "src", "__tests__"))
  );
  const hasReview     = fs.existsSync(path.join(SPECS_DIR, orderId, "review-report.md"));
  const hasDeliverables = fs.existsSync(deliverablesDir);
  const hasFailed     = fs.existsSync(path.join(orderDir, ".failed"));
  const isProcessing  = fs.existsSync(path.join(orderDir, ".processing"));
  const isAwaiting    = fs.existsSync(path.join(orderDir, ".awaiting-payment"));

  let deployUrl = "";
  if (hasDeliverables) {
    const readme = path.join(deliverablesDir, "README.md");
    if (fs.existsSync(readme)) {
      const m = fs.readFileSync(readme, "utf-8").match(/https:\/\/[^\s)]+\.vercel\.app/);
      if (m) deployUrl = m[0];
    }
  }

  const phases = [
    { label: "受注",         sublabel: "ご依頼を受け付けました",            done: true,           active: false },
    { label: "見積もり",     sublabel: "要件分析・お見積もり",               done: hasSales,       active: !hasSales },
    { label: "お支払い",     sublabel: hasPayment ? "お支払いを確認しました" : isAwaiting ? "お支払いをお待ちしています" : "お支払い確認後に開発を開始します",
                                                                              done: hasPayment,     active: isAwaiting && !hasPayment },
    { label: "要件定義",     sublabel: "詳細な仕様を策定中",                 done: hasSpecs,       active: hasPayment && !hasSpecs },
    { label: "設計",         sublabel: "システム設計・アーキテクチャ策定",   done: hasDesigns,     active: hasSpecs && !hasDesigns },
    { label: "実装",         sublabel: hasSrc ? `${srcFileCount}ファイルを作成` : "コーディング中",
                                                                              done: hasTests || hasDeliverables, active: hasSrc && !hasTests && !hasDeliverables },
    { label: "テスト・レビュー", sublabel: hasReview ? "レビュー完了" : hasTests ? "テスト実行中" : "品質確認",
                                                                              done: hasReview || hasDeliverables, active: hasTests && !hasDeliverables },
    { label: "納品",         sublabel: hasDeliverables ? "納品完了！" : "デプロイ・納品準備",
                                                                              done: hasDeliverables, active: hasReview && !hasDeliverables },
  ];

  const currentPhaseIndex = phases.reduce((acc, p, i) => (p.done ? i : acc), 0);
  const progressPercent = Math.round((currentPhaseIndex / (phases.length - 1)) * 100);

  let statusLabel = "受付済み";
  if (hasFailed)           statusLabel = "エラー停止";
  else if (hasDeliverables) statusLabel = "納品完了";
  else if (isProcessing)   statusLabel = "開発中";
  else if (isAwaiting)     statusLabel = "お支払い待ち";
  else if (hasSales)       statusLabel = "見積完了";

  return { orderId, projectName, statusLabel, progressPercent, phases, deployUrl, hasFailed, updatedAt: new Date().toISOString() };
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

async function getOrderStatusFromBlob(orderId: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;

  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: `orders/${orderId}/`, token });

  if (blobs.length === 0) return null;

  // brief.md
  const briefBlob = blobs.find(b => b.pathname === `orders/${orderId}/brief.md`);
  let projectName = orderId;
  if (briefBlob) {
    const text = await fetchBlobText(briefBlob.downloadUrl, token).catch(() => "");
    projectName = text.match(/^# 案件依頼: (.+)/m)?.[1] ?? orderId;
  }

  // status-update.md
  const statusBlob = blobs.find(b => b.pathname === `orders/${orderId}/status-update.md`);
  const hasPayment = blobs.some(b => b.pathname === `orders/${orderId}/payment-received.md`);
  const hasCancelled = blobs.some(b => b.pathname === `orders/${orderId}/subscription-cancelled.md`);

  let statusLabel = "受付済み";
  let progressPercent = 0;
  let deployUrl = "";
  let hasFailed = false;
  let currentPhase = "reception";

  if (statusBlob) {
    const text = await fetchBlobText(statusBlob.downloadUrl, token).catch(() => "");
    const rawLabel  = text.match(/^ステータス: (.+)/m)?.[1]?.trim() ?? "";
    const rawPhase  = text.match(/^現在フェーズ: (.+)/m)?.[1]?.trim() ?? "";
    const rawProg   = text.match(/^進捗: (\d+)/m)?.[1];
    const rawDeploy = text.match(/^デプロイURL: (.+)/m)?.[1]?.trim() ?? "";

    if (rawLabel)  statusLabel    = rawLabel;
    if (rawPhase)  currentPhase   = rawPhase;
    if (rawProg)   progressPercent = parseInt(rawProg, 10);
    if (rawDeploy && rawDeploy !== "") deployUrl = rawDeploy;
    hasFailed = rawLabel.includes("エラー");
  } else if (hasPayment) {
    statusLabel     = "🔄 開発中";
    progressPercent = 10;
    currentPhase    = "payment";
  }

  // フェーズ表示（Blob環境では簡易版）
  const phaseMap: Record<string, number> = {
    reception: 0, sales: 1, payment: 2, requirements: 3,
    design: 4, development: 5, qa: 6, delivery: 7,
  };
  const currentIdx = phaseMap[currentPhase] ?? 0;

  const phaseLabels = [
    { label: "受注",           sublabel: "ご依頼を受け付けました" },
    { label: "見積もり",       sublabel: "要件分析・お見積もり" },
    { label: "お支払い",       sublabel: hasPayment ? "お支払いを確認しました" : "お支払い確認後に開発を開始します" },
    { label: "要件定義",       sublabel: "詳細な仕様を策定中" },
    { label: "設計",           sublabel: "システム設計・アーキテクチャ策定" },
    { label: "実装",           sublabel: "コーディング中" },
    { label: "テスト・レビュー", sublabel: "品質確認" },
    { label: "納品",           sublabel: statusLabel.includes("納品完了") ? "納品完了！" : "デプロイ・納品準備" },
  ];

  const phases = phaseLabels.map((p, i) => ({
    ...p,
    done: i <= currentIdx,
    active: i === currentIdx + 1,
  }));

  return { orderId, projectName, statusLabel, progressPercent, phases, deployUrl, hasFailed, updatedAt: new Date().toISOString() };
}

// =========================================================
// Handler
// =========================================================

export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  if (process.env.VERCEL_ENV) {
    try {
      const result = await getOrderStatusFromBlob(orderId);
      if (!result) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json(result);
    } catch (err) {
      console.error("[api/status/orderId] Blob読み取りエラー:", err);
      return NextResponse.json({ error: "Blob読み取りエラー" }, { status: 500 });
    }
  }

  // ローカル環境
  const result = getOrderStatusLocal(orderId);
  if (!result) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}
