/**
 * さくら鍼灸整骨院 — 修正フロー 3往復シミュレーション
 *
 * 実際の画面操作（Playwright）を使い、顧客が修正依頼を送り、
 * AIエージェントが処理して完了するサイクルを3回繰り返す。
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE = "http://localhost:3000";
const ORDER_ID = "2026-03-24T15-01-54-reservationtest";
const ORDER_DIR = path.join(__dirname, "..", "..", "orders", ORDER_ID);
const results = [];

function log(round, step, status, detail = "") {
  const mark = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "ℹ️";
  const msg = `${mark} [第${round}回] ${step}${detail ? " — " + detail : ""}`;
  console.log(msg);
  results.push({ round, step, status, detail });
}

function logAgent(round, msg) {
  console.log(`  🤖 [エージェント] ${msg}`);
}

/** ローカルファイルシステム上で次のrevision番号を返す */
function nextRevisionNo() {
  if (!fs.existsSync(ORDER_DIR)) return 1;
  const existing = fs.readdirSync(ORDER_DIR).filter(f => /^revision-\d+\.md$/.test(f));
  return existing.length + 1;
}

/** エージェントによる修正処理をシミュレート（ローカルファイル操作） */
function simulateAgentProcessing(revNo, agentWork) {
  const pad = String(revNo).padStart(3, "0");

  // 修正完了フラグを立てる
  const doneFlag = path.join(ORDER_DIR, `.revision-${pad}-done`);
  fs.writeFileSync(doneFlag, new Date().toISOString(), "utf-8");
  logAgent("*", `修正完了フラグ作成: .revision-${pad}-done`);

  // メール送信済みフラグ（メール機能はローカルでは発火しないため手動）
  const emailFlag = path.join(ORDER_DIR, `.revision-${pad}-email-sent`);
  fs.writeFileSync(emailFlag, new Date().toISOString(), "utf-8");
  logAgent("*", `メール送信済みフラグ作成: .revision-${pad}-email-sent`);

  // 作業ログを模したchangelogを追記
  const changelogPath = path.join(__dirname, "..", "..", "deliverables", ORDER_ID, "CHANGELOG.md");
  if (fs.existsSync(changelogPath)) {
    const entry = `\n## 修正 #${revNo} (${new Date().toISOString().slice(0, 10)})\n- ${agentWork}\n`;
    fs.appendFileSync(changelogPath, entry, "utf-8");
    logAgent("*", `CHANGELOG.md 更新`);
  }

  logAgent("*", `作業内容: ${agentWork}`);
}

async function runRound(page, roundNo, scenario) {
  console.log(`\n${"─".repeat(50)}`);
  console.log(`📋 第${roundNo}回修正サイクル開始`);
  console.log(`${"─".repeat(50)}`);

  const revNo = nextRevisionNo();
  const revPad = String(revNo).padStart(3, "0");

  // ── STEP 1: フィードバックページを開く ──
  try {
    const url = `${BASE}/feedback/${ORDER_ID}?name=${encodeURIComponent("さくら鍼灸整骨院")}&rev=${roundNo}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const h1 = await page.locator("h1").first().textContent().catch(() => "");
    log(roundNo, "フィードバックページ表示", h1 ? "PASS" : "FAIL", h1?.trim().slice(0, 30));
  } catch (e) {
    log(roundNo, "フィードバックページ表示", "FAIL", String(e).slice(0, 80));
    return;
  }

  // ── STEP 2: 修正内容を入力 ──
  try {
    const textarea = page.locator("textarea").first();
    const visible = await textarea.isVisible().catch(() => false);
    if (!visible) { log(roundNo, "テキストエリア表示", "FAIL"); return; }

    await textarea.fill(scenario.feedback);
    await page.waitForTimeout(300);

    const submitBtn = page.locator("button[type='submit']").first();
    const enabled = await submitBtn.isEnabled().catch(() => false);
    log(roundNo, "テキスト入力・ボタン有効化", enabled ? "PASS" : "FAIL",
      `${scenario.feedback.slice(0, 40).replace(/\n/g, " ")}...`);
  } catch (e) {
    log(roundNo, "テキスト入力", "FAIL", String(e).slice(0, 80));
    return;
  }

  // ── STEP 3: 送信 ──
  try {
    console.log(`  📤 修正依頼を送信中... (revision-${revPad}.md として保存予定)`);
    await page.locator("button[type='submit']").first().click();
    // 初回APIコンパイル（コールドスタート）を考慮して完了画面が出るまで最大8秒待機
    let success = false;
    try {
      await page.waitForSelector("text=受け付けました", { timeout: 8000 });
      success = true;
    } catch {
      // タイムアウト時はbodyTextで判断
    }
    if (!success) await page.waitForTimeout(2000);
    const bodyText = await page.locator("body").textContent() ?? "";
    if (!success) success = bodyText.includes("受け付けました") || bodyText.includes("修正依頼を受け付け");
    log(roundNo, "送信後の完了画面表示", success ? "PASS" : "FAIL",
      success ? "「受け付けました」表示確認" : bodyText.slice(100, 160).trim());

    // 実際にファイルが保存されたか確認
    const savedFile = path.join(ORDER_DIR, `revision-${revPad}.md`);
    const fileSaved = fs.existsSync(savedFile);
    log(roundNo, `revision-${revPad}.md 保存確認`, fileSaved ? "PASS" : "FAIL",
      fileSaved ? "ファイル存在確認" : "ファイルが存在しません");

    if (fileSaved) {
      const content = fs.readFileSync(savedFile, "utf-8");
      const hasContent = content.includes(scenario.feedback.slice(0, 20));
      log(roundNo, "修正内容の保存正確性", hasContent ? "PASS" : "FAIL",
        hasContent ? "内容一致" : "内容不一致");
    }
  } catch (e) {
    log(roundNo, "修正依頼送信", "FAIL", String(e).slice(0, 80));
    return;
  }

  // ── STEP 4: エージェント処理シミュレーション ──
  console.log(`\n  ⏳ AIエージェントが修正を処理中...`);
  await page.waitForTimeout(500);
  simulateAgentProcessing(revNo, scenario.agentWork);

  // ── STEP 5: ステータスページで状態確認 ──
  try {
    await page.goto(`${BASE}/status/${ORDER_ID}`, { waitUntil: "networkidle" });
    // status APIのコンパイル完了・データフェッチを待つ（初回コールドスタート考慮）
    try {
      await page.waitForSelector("text=100%", { timeout: 8000 });
    } catch {
      // タイムアウトでも続行
    }
    await page.waitForTimeout(500);

    const statusText = await page.locator("h1").first().textContent().catch(() => "");
    const progressEl = await page.locator("[class*='font-mono']").allTextContents();
    const progressText = progressEl.find(t => t.includes("%")) ?? "";

    log(roundNo, "修正後ステータスページ確認", statusText ? "PASS" : "FAIL",
      `${statusText?.trim()} / ${progressText.trim()}`);

    // アクションボタン（次の修正依頼・検収）が引き続き表示されているか
    const actionBtns = await page.locator("a[href*='/feedback/'], a[href*='/acceptance/']").count();
    log(roundNo, "修正後アクションボタン継続表示", actionBtns >= 2 ? "PASS" : "FAIL",
      `${actionBtns}件`);
  } catch (e) {
    log(roundNo, "修正後ステータス確認", "FAIL", String(e).slice(0, 80));
  }

  console.log(`  ✔️  第${roundNo}回修正サイクル完了\n`);
}

async function run() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  さくら鍼灸整骨院 — 修正フロー 3往復シミュレーション  ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log(`対象案件: ${ORDER_ID}`);
  console.log(`現在の修正ファイル数: ${nextRevisionNo() - 1}件\n`);

  const scenarios = [
    {
      feedback: [
        "・トップページのキャッチコピーを「体の芯から整える、確かな施術」に変更してほしい",
        "・営業時間を 9:00〜21:00（最終受付 20:30）に修正してください",
        "・スマホ表示でロゴが少し小さいので、もう少し大きくしてほしいです",
      ].join("\n"),
      agentWork: "トップキャッチコピー変更・営業時間テキスト更新・モバイルロゴサイズ調整",
    },
    {
      feedback: [
        "・スタッフ紹介セクションが縦に長すぎるので、カードを2列グリッドにしてコンパクトにしてほしい",
        "・「今すぐ予約」ボタンの色を現在の緑から #2563eb（青）に変えてください",
        "・フッターに「駐車場10台完備・提携コインパーキングあり」を追加してほしいです",
      ].join("\n"),
      agentWork: "スタッフ紹介2列グリッド化・予約ボタン色変更(→青)・フッター駐車場情報追加",
    },
    {
      feedback: [
        "・トップのスライドショーの切替を 3秒 → 5秒 にしてほしい（少し早すぎる）",
        "・ページ右下に「予約する」のフローティングボタンを追加してほしい",
        "・以上で問題なくなりました！全体的に仕上がりに満足しています。ありがとうございます。",
      ].join("\n"),
      agentWork: "スライダー切替速度調整(3s→5s)・フローティング予約ボタン追加・最終確認完了",
    },
  ];

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: "ja-JP",
  });
  const page = await ctx.newPage();

  for (let i = 0; i < scenarios.length; i++) {
    await runRound(page, i + 1, scenarios[i]);
  }

  await browser.close();

  // ── 最終サマリー ──
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║                   最終結果                       ║");
  console.log("╚══════════════════════════════════════════════════╝");

  const pass = results.filter(r => r.status === "PASS").length;
  const fail = results.filter(r => r.status === "FAIL").length;
  console.log(`📊 PASS: ${pass}  ❌ FAIL: ${fail}  合計: ${results.length}ステップ`);

  if (fail > 0) {
    console.log("\n❌ 失敗したステップ:");
    results.filter(r => r.status === "FAIL").forEach(r =>
      console.log(`  第${r.round}回「${r.step}」: ${r.detail}`)
    );
  }

  // 作成されたrevisionファイルの一覧
  console.log("\n📁 修正ファイル一覧 (orders/" + ORDER_ID + "/):");
  if (fs.existsSync(ORDER_DIR)) {
    fs.readdirSync(ORDER_DIR)
      .filter(f => /^revision-\d+/.test(f))
      .sort()
      .forEach(f => {
        const stat = fs.statSync(path.join(ORDER_DIR, f));
        console.log(`  ${f}  (${stat.mtime.toLocaleString("ja-JP")})`);
      });
  }

  if (fail === 0) {
    console.log("\n🎉 3往復シミュレーション成功！修正フローに問題なし。");
  }
}

run().catch(e => { console.error("Fatal:", e); process.exit(1); });
