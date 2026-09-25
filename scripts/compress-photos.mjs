/**
 * One-off image performance pass (audit Phase-1, item 1).
 *
 * - Re-compresses every public/photos/*.jpg IN PLACE (same filenames, so no
 *   reference — component, CSS, DB row or admin upload — ever breaks).
 * - Caps width at 1600px, quality 72 progressive mozjpeg: visually
 *   indistinguishable on this dark luxury UI at the sizes actually displayed.
 * - Never grows a file: the smaller of (original, re-compressed) wins.
 * - Emits -w480 / -w960 responsive twins ONLY for the hero polaroids so the
 *   above-the-fold images can use srcset.
 *
 * Run: node scripts/compress-photos.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "photos");
const MAX_W = 1400;
const Q = 68;

const HERO = ["DaNaYhvEwXS_0.jpg", "DZRwirYjDE__0.jpg", "DYQ2pCbjHoE_0.jpg"];

let saved = 0;
let touched = 0;

for (const f of fs.readdirSync(DIR).filter((x) => x.toLowerCase().endsWith(".jpg"))) {
  const file = path.join(DIR, f);
  const before = fs.statSync(file).size;
  const meta = await sharp(file).metadata();
  const targetW = Math.min(meta.width || MAX_W, MAX_W);

  const buf = await sharp(file)
    .rotate() // honour EXIF orientation
    .resize({ width: targetW, withoutEnlargement: true })
    .jpeg({ quality: Q, mozjpeg: true, progressive: true, optimiseScans: true })
    .toBuffer();

  if (buf.length < before) {
    fs.writeFileSync(file, buf);
    saved += before - buf.length;
    touched++;
    if (before > 90_000) console.log(`${f}: ${(before / 1024) | 0}KB -> ${(buf.length / 1024) | 0}KB`);
  }
}

// Responsive twins for the eager hero polaroids.
for (const f of HERO) {
  const file = path.join(DIR, f);
  if (!fs.existsSync(file)) continue;
  const base = f.replace(/\.jpg$/, "");
  for (const [w, suffix] of [[480, "-w480"], [960, "-w960"]]) {
    const out = path.join(DIR, `${base}${suffix}.jpg`);
    await sharp(file)
      .resize({ width: w, withoutEnlargement: true })
      .jpeg({ quality: Q, mozjpeg: true, progressive: true })
      .toFile(out);
    console.log(`srcset twin: photos/${base}${suffix}.jpg (${(fs.statSync(out).size / 1024) | 0}KB)`);
  }
}

console.log(`\nDone. ${touched} files shrank, total saved ${(saved / 1024 / 1024).toFixed(2)} MB`);
