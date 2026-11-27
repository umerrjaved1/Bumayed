/**
 * Download one distinct photo per bulk dummy listing into public/seed-photos.
 * Sources are Openverse photograph results (Creative Commons). Re-run is safe:
 * existing files are kept.
 */
import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const OUT_DIR = path.join(process.cwd(), "public", "seed-photos");
const COUNTS = { cars: 45, motorcycles: 18, boats: 15 };
const QUERIES = {
  cars: [
    "mercedes benz sedan",
    "toyota land cruiser",
    "nissan patrol suv",
    "bmw suv",
    "lexus suv",
    "white sedan car",
    "black luxury car",
    "sports car street",
  ],
  motorcycles: [
    "harley davidson motorcycle",
    "sport motorcycle",
    "cruiser motorcycle",
    "yamaha motorcycle",
  ],
  boats: ["motor yacht", "speedboat", "jet ski", "fishing boat"],
};
const SKIP =
  /lego|logo|icon|diagram|drawing|illustration|toy|poster|map|clipart|cartoon|render|model car|hot wheel|diecast|miniature/i;

const headers = {
  "User-Agent": "BumayedSeed/1.0 (development dummy photos)",
  Accept: "application/json",
};

async function search(query, page) {
  const url = new URL("https://api.openverse.org/v1/images/");
  url.searchParams.set("q", query);
  url.searchParams.set("page_size", "20");
  url.searchParams.set("page", String(page));
  url.searchParams.set("category", "photograph");
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Openverse ${response.status} for ${query}`);
  const body = await response.json();
  return body.results ?? [];
}

async function download(url, dest) {
  const response = await fetch(url, { headers, redirect: "follow" });
  if (!response.ok || !response.body) return false;
  const type = response.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) return false;
  await pipeline(response.body, createWriteStream(dest));
  const info = await stat(dest);
  if (info.size < 20_000) return false;
  const bytes = await readFile(dest);
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const png = bytes[0] === 0x89 && bytes[1] === 0x50;
  return jpeg || png;
}

async function collect(kind) {
  const found = [];
  const seen = new Set();
  for (const query of QUERIES[kind]) {
    for (let page = 1; page <= 4 && found.length < COUNTS[kind]; page++) {
      const results = await search(query, page);
      for (const item of results) {
        if (found.length >= COUNTS[kind]) break;
        const title = item.title ?? "";
        if (SKIP.test(title)) continue;
        if ((item.width ?? 0) < 640) continue;
        const url = item.url;
        if (!url || seen.has(url)) continue;
        seen.add(url);
        found.push({
          title,
          url,
          creator: item.creator ?? "",
          license: `${item.license ?? ""} ${item.license_version ?? ""}`.trim(),
          source: item.foreign_landing_url ?? url,
        });
      }
      if (results.length === 0) break;
    }
  }
  if (found.length < COUNTS[kind] * 2) {
    for (let page = 5; page <= 8 && found.length < COUNTS[kind] * 2; page++) {
      const results = await search(QUERIES[kind][0], page);
      for (const item of results) {
        const title = item.title ?? "";
        if (SKIP.test(title)) continue;
        if ((item.width ?? 0) < 640) continue;
        const url = item.url;
        if (!url || seen.has(url)) continue;
        seen.add(url);
        found.push({
          title,
          url,
          creator: item.creator ?? "",
          license: `${item.license ?? ""} ${item.license_version ?? ""}`.trim(),
          source: item.foreign_landing_url ?? url,
        });
      }
    }
  }
  return found;
}

async function hashFile(file) {
  const bytes = await readFile(file);
  return createHash("md5").update(bytes).digest("hex");
}

/** Replace duplicate or non-JPEG bulk photos with unused search results. */
async function repairDuplicates() {
  const files = (await readdir(OUT_DIR)).filter((name) => name.startsWith("bulk-"));
  const hashes = new Set();
  const bad = [];
  for (const name of files) {
    const file = path.join(OUT_DIR, name);
    const bytes = await readFile(file);
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
    const hash = createHash("md5").update(bytes).digest("hex");
    if (!jpeg || hashes.has(hash)) bad.push(file);
    else hashes.add(hash);
  }
  if (bad.length === 0) return;
  const photos = await collect("motorcycles");
  photos.push(...(await collect("cars")));
  let cursor = 0;
  for (const file of bad) {
    let saved = false;
    while (cursor < photos.length && !saved) {
      const photo = photos[cursor++];
      const ok = await download(photo.url, file);
      if (!ok) continue;
      const hash = await hashFile(file);
      const bytes = await readFile(file);
      const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
      if (!jpeg || hashes.has(hash)) continue;
      hashes.add(hash);
      saved = true;
      console.log(`replaced ${path.basename(file)}`);
    }
    if (!saved) throw new Error(`Could not replace ${file}`);
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const credits = [];
  for (const kind of Object.keys(COUNTS)) {
    const photos = await collect(kind);
    let cursor = 0;
    for (let i = 0; i < COUNTS[kind]; i++) {
      const slug = `bulk-${kind}-${String(i + 1).padStart(2, "0")}`;
      const dest = path.join(OUT_DIR, `${slug}.jpg`);
      const existing = await stat(dest).catch(() => null);
      if (existing && existing.size >= 20_000) {
        credits.push(`${slug}.jpg — kept existing file`);
        console.log(`${slug} kept`);
        continue;
      }
      let saved = null;
      while (cursor < photos.length && !saved) {
        const photo = photos[cursor++];
        const ok = await download(photo.url, dest);
        if (ok) saved = photo;
      }
      if (!saved) throw new Error(`Ran out of ${kind} photos at ${slug}`);
      const info = await stat(dest);
      credits.push(
        `${slug}.jpg — ${saved.title} by ${saved.creator} (${saved.license}) ${saved.source}`,
      );
      console.log(`${slug} ${Math.round(info.size / 1024)}KB`);
    }
  }
  await writeFile(path.join(OUT_DIR, "BULK-CREDITS.txt"), `${credits.join("\n")}\n`);
  console.log(`Saved ${credits.length} photos.`);
  await repairDuplicates();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
