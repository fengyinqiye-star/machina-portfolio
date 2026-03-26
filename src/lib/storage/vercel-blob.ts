import type { StorageAdapter } from "./adapter";

export class VercelBlobAdapter implements StorageAdapter {
  async saveOrder(orderId: string, content: string): Promise<{ url: string }> {
    const { put } = await import("@vercel/blob");
    const blob = await put(`orders/${orderId}/brief.md`, content, {
      access: "private",
      contentType: "text/markdown",
    });
    return { url: blob.url };
  }

  async saveFile(orderId: string, filename: string, content: string): Promise<void> {
    const { put } = await import("@vercel/blob");
    await put(`orders/${orderId}/${filename}`, content, {
      access: "private",
      contentType: "text/plain",
    });
  }
}
