/**
 * Replace bulk dummy listing photos with free Pexels stock photographs.
 * Every id below is a Pexels photo whose page title is a car, motorcycle, or
 * boat. Re-run overwrites public/seed-photos/bulk-*.jpg.
 * License: https://www.pexels.com/license/
 */
import { createWriteStream } from "node:fs";
import { mkdir, readFile, rename, rm, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const OUT_DIR = path.join(process.cwd(), "public", "seed-photos");
const NEED = { cars: 45, motorcycles: 18, boats: 15 };

const PEXELS = {
  cars: [
    112460, 170811, 116675, 210019, 244206, 358070, 20430140, 17792223,
    17744273, 19410447, 14776590, 26691312, 25340995, 12274363, 31458555,
    27489640, 34661680, 26795266, 9739260, 7725068, 12736871, 17791130,
    2612855, 17581985, 38077343,
  ],
  motorcycles: [
    7969635, 2611658, 16811898, 31700702, 25155146, 2393816, 29283090,
    18203171, 18213277, 17821689, 10660495,
  ],
  boats: [
    30939177, 625418, 8589353, 37887235, 9650653, 33722966, 11932175,
    12920303, 21822827, 7444981,
  ],
};

function pexelsUrl(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`;
}

async function download(url, dest) {
  const response = await fetch(url, {
    headers: { "User-Agent": "BumayedSeed/1.0 (development dummy photos)" },
    redirect: "follow",
  });
  if (!response.ok || !response.body) return false;
  const type = response.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) return false;
  const temp = `${dest}.part`;
  await pipeline(response.body, createWriteStream(temp));
  const info = await stat(temp);
  const bytes = await readFile(temp);
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  if (info.size < 20_000 || !jpeg) {
    await unlink(temp).catch(() => {});
    return false;
  }
  await rename(temp, dest).catch(async () => {
    await unlink(dest).catch(() => {});
    await rename(temp, dest);
  });
  return true;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const credits = [];
  for (const [kind, ids] of Object.entries(PEXELS)) {
    const files = [];
    for (const id of ids) {
      const dest = path.join(OUT_DIR, `.tmp-${kind}-${id}.jpg`);
      const ok = await download(pexelsUrl(id), dest);
      if (!ok) {
        console.log(`skip ${kind} ${id}`);
        continue;
      }
      files.push({ id, dest });
      console.log(`${kind} ${id} ok`);
    }
    if (files.length === 0) throw new Error(`No ${kind} photos downloaded`);
    for (let i = 0; i < NEED[kind]; i++) {
      const photo = files[i % files.length];
      const slug = `bulk-${kind}-${String(i + 1).padStart(2, "0")}`;
      const dest = path.join(OUT_DIR, `${slug}.jpg`);
      await rename(photo.dest, dest).catch(async () => {
        const bytes = await readFile(files[i % files.length].dest);
        await writeFile(dest, bytes);
      });
      // Keep a copy so later slots can reuse the same photograph.
      if (i < files.length) {
        const bytes = await readFile(dest);
        await writeFile(photo.dest, bytes);
      }
      credits.push(
        `${slug}.jpg — Pexels photo ${photo.id} (https://www.pexels.com/photo/${photo.id}/)`,
      );
    }
    for (const photo of files) await unlink(photo.dest).catch(() => {});
  }
  await writeFile(path.join(OUT_DIR, "BULK-CREDITS.txt"), `${credits.join("\n")}\n`);
  await rm(path.join(OUT_DIR, "_probe"), { recursive: true, force: true });
  console.log(`Saved ${credits.length} stock photos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
