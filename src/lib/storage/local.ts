import fs from "fs/promises";
import path from "path";
import type { StorageAdapter } from "./adapter";

export class LocalAdapter implements StorageAdapter {
  private readonly ordersDir: string;

  constructor() {
    // プロジェクトルートの orders/ ディレクトリに保存
    this.ordersDir = path.resolve(process.cwd(), "..", "..", "orders");
  }

  async saveOrder(orderId: string, content: string): Promise<{ path: string }> {
    const dir = path.join(this.ordersDir, orderId);
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, "brief.md");
    await fs.writeFile(filePath, content, "utf-8");
    return { path: filePath };
  }

  async saveFile(orderId: string, filename: string, content: string): Promise<void> {
    const dir = path.join(this.ordersDir, orderId);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), content, "utf-8");
  }
}
