import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function sniffMime(buf: Buffer): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

/**
 * Local filesystem storage adapter for Phase 5 until R2/S3 credentials exist.
 * Files land under public/uploads/listings so Next can serve them statically.
 */
export async function saveListingImage(input: {
  listingId: string;
  file: Buffer;
  claimedMime?: string;
}): Promise<{ objectKey: string; mime: string; sizeBytes: number }> {
  const maxBytes = env.MAX_IMAGE_SIZE_MB * 1024 * 1024;
  if (input.file.length > maxBytes) {
    throw new Error("FILE_TOO_LARGE");
  }

  const mime = sniffMime(input.file);
  if (!mime || !ALLOWED.has(mime)) {
    throw new Error("UNSUPPORTED_TYPE");
  }

  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const objectKey = `listings/${input.listingId}/${randomUUID()}.${ext}`;
  const abs = path.join(process.cwd(), "public", "uploads", objectKey);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, input.file);

  return { objectKey, mime, sizeBytes: input.file.length };
}

export async function deleteListingImage(objectKey: string): Promise<void> {
  const abs = path.join(process.cwd(), "public", "uploads", objectKey);
  try {
    await unlink(abs);
  } catch {
    // already gone
  }
}

export function publicUrlForKey(objectKey: string): string {
  if (env.STORAGE_PUBLIC_URL) {
    return `${env.STORAGE_PUBLIC_URL.replace(/\/$/, "")}/${objectKey}`;
  }
  return `/uploads/${objectKey}`;
}
