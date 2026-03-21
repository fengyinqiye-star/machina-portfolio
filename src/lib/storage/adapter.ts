export interface StorageAdapter {
  saveOrder(orderId: string, content: string): Promise<{ url?: string; path?: string }>;
}

export async function getStorageAdapter(): Promise<StorageAdapter> {
  if (process.env.VERCEL_ENV) {
    const { VercelBlobAdapter } = await import("./vercel-blob");
    return new VercelBlobAdapter();
  }
  const { LocalAdapter } = await import("./local");
  return new LocalAdapter();
}
