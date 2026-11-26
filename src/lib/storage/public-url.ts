/** Safe for client bundles. Seed photos stay on the site; new uploads use the public bucket. */
export function publicUrlForKey(objectKey: string): string {
  const seed = objectKey.match(/^seed\/([^/]+)\/1\.jpg$/);
  if (seed) return `/seed-photos/${seed[1]}.jpg`;
  const base =
    process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL || process.env.STORAGE_PUBLIC_URL;
  if (base) return `${base.replace(/\/$/, "")}/${objectKey}`;
  return `/uploads/${objectKey}`;
}
