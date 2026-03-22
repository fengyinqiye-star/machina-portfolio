import type { StorageAdapter } from "./adapter";

export class VercelBlobAdapter implements StorageAdapter {
  async saveOrder(orderId: string, content: string): Promise<{ url: string }> {
    // @vercel/blob を動的インポート（Vercel環境でのみ使用）
    const { put } = await import("@vercel/blob");
    const blob = await put(`orders/${orderId}/brief.md`, content, {
      access: "private",
      contentType: "text/markdown",
    });
    return { url: blob.url };
  }
}
