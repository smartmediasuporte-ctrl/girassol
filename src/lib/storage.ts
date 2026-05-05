import path from "node:path";

export type UploadResult = { url: string; size: number; contentType: string };

const ALLOWED = new Map<string, string>([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
]);

export function detectExtension(contentType: string): string | null {
  return ALLOWED.get(contentType) ?? null;
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function uploadFile(
  buffer: Buffer,
  opts: { filename: string; contentType: string; folder?: string },
): Promise<UploadResult> {
  const folder = opts.folder ?? "girassol";
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const key = `uploads/${folder}/${opts.filename}`;
    const blob = await put(key, buffer, {
      access: "public",
      contentType: opts.contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    return { url: blob.url, size: buffer.length, contentType: opts.contentType };
  }
  const fs = await import("node:fs/promises");
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, opts.filename), buffer);
  return {
    url: `/uploads/${folder}/${opts.filename}`,
    size: buffer.length,
    contentType: opts.contentType,
  };
}
