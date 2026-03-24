/**
 * @jest-environment node
 *
 * POST /api/orders のテスト
 * Note: Next.js API Routeのテストはintegrationに近いため、
 *       ストレージアダプターはモックする。
 */
import { NextRequest } from "next/server";

// ストレージアダプターをモック
jest.mock("@/lib/storage/adapter", () => ({
  getStorageAdapter: jest.fn().mockResolvedValue({
    saveOrder: jest.fn().mockResolvedValue({ path: "/tmp/test/brief.md" }),
  }),
}));

// レートリミットをモック（テストではすべて許可）
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true }),
}));

import { POST } from "../route";

const makeRequest = (body: unknown, ip = "127.0.0.1") =>
  new NextRequest("http://localhost/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });

const validBody = {
  projectName: "テスト案件",
  overview: "これはテスト用の案件です。10文字以上の概要。",
  contactEmail: "test@example.com",
  contactName: "テスト太郎",
  honeypot: "",
};

describe("POST /api/orders", () => {
  it("正常系: 正しいデータで 201 を返す", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.orderId).toBeDefined();
  });

  it("バリデーションエラー: 必須フィールド欠如で 422 を返す", async () => {
    const res = await POST(makeRequest({ projectName: "", overview: "短い" }));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.details).toBeDefined();
  });

  it("バリデーションエラー: メール形式不正で 422 を返す", async () => {
    const res = await POST(makeRequest({ ...validBody, contactEmail: "invalid-email" }));
    expect(res.status).toBe(422);
  });

  it("ハニーポット: honeypot に値がある場合は 200 を返しダミーレスポンス", async () => {
    const res = await POST(makeRequest({ ...validBody, honeypot: "bot-value" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.orderId).toBe("dummy");
  });

  it("レートリミット: 制限超過で 429 を返す", async () => {
    const { checkRateLimit } = await import("@/lib/rateLimit");
    (checkRateLimit as jest.Mock).mockReturnValueOnce({ allowed: false, retryAfter: 30 });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(429);
  });
});
