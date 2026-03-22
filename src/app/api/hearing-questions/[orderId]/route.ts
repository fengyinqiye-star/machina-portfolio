import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";
import fs from "fs";
import path from "path";

// hearing-questions-{n}.md をパースして質問リストを返す
function parseQuestions(md: string): { key: string; label: string; placeholder: string }[] {
  const lines = md.split("\n");
  const questions: { key: string; label: string; placeholder: string }[] = [];
  let current: Partial<{ key: string; label: string; placeholder: string }> = {};

  for (const line of lines) {
    const q = line.match(/^##\s+Q(\d+)[:：]\s*(.+)/);
    if (q) {
      if (current.key) questions.push(current as { key: string; label: string; placeholder: string });
      current = { key: `q${q[1]}`, label: q[2].trim(), placeholder: "" };
      continue;
    }
    const hint = line.match(/^(?:ヒント|例|Hint|Example)[:：]\s*(.+)/i);
    if (hint && current.key) {
      current.placeholder = hint[1].trim();
    }
  }
  if (current.key) questions.push(current as { key: string; label: string; placeholder: string });
  return questions;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  // 最新のhearing-questions-{n}.mdを取得
  let content = "";
  let round = 1;

  if (process.env.VERCEL_ENV) {
    const blobs = await list({ prefix: `orders/${orderId}/hearing-questions-`, token: process.env.BLOB_READ_WRITE_TOKEN });
    if (blobs.blobs.length === 0) {
      return NextResponse.json({ questions: [], round: 0, ready: false });
    }
    // 最新のもの（番号が一番大きいもの）
    const latest = blobs.blobs.sort((a, b) => b.pathname.localeCompare(a.pathname))[0];
    round = Number(latest.pathname.match(/hearing-questions-(\d+)\.md/)?.[1] ?? 1);
    const res = await fetch(latest.downloadUrl, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });
    content = await res.text();
  } else {
    const ROOT = path.resolve(process.cwd(), "..", "..");
    const orderDir = path.join(ROOT, "orders", orderId);
    const files = fs.existsSync(orderDir)
      ? fs.readdirSync(orderDir).filter(f => f.match(/^hearing-questions-\d+\.md$/)).sort()
      : [];
    if (files.length === 0) return NextResponse.json({ questions: [], round: 0, ready: false });
    const latest = files[files.length - 1];
    round = Number(latest.match(/hearing-questions-(\d+)\.md/)?.[1] ?? 1);
    content = fs.readFileSync(path.join(orderDir, latest), "utf-8");
  }

  const questions = parseQuestions(content);
  return NextResponse.json({ questions, round, ready: true });
}
