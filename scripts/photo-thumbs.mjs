// Build step (npm "prebuild"): 540px WebP thumbnails for the repo photos in
// public/photos → public/photos/thumb/, plus lib/photo-thumbs.json listing the
// photos that got one. Grid cards (gallery masonry) show the thumbnail on
// phones instead of the full 900–1080px photo; the lightbox keeps the original.
// Never fatal: if sharp is unavailable or a file fails, the manifest only lists
// the thumbnails that really exist and the site falls back to the originals.
import { readdirSync, mkdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const SRC = "public/photos";
const OUT = "public/photos/thumb";
const MANIFEST = "lib/photo-thumbs.json";
const WIDTH = 540;
const QUALITY = 70;

const ready = [];
try {
  writeFileSync(MANIFEST, "[]\n");
  const sharp = (await import("sharp")).default;
  mkdirSync(OUT, { recursive: true });
  for (const f of readdirSync(SRC)) {
    if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
    const src = path.join(SRC, f);
    const out = path.join(OUT, f.replace(/\.[^.]+$/, ".webp"));
    try {
      if (!existsSync(out) || statSync(out).mtimeMs < statSync(src).mtimeMs) {
        await sharp(src).rotate().resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(out);
      }
      ready.push(`/photos/${f}`);
    } catch (e) {
      console.warn(`[photo-thumbs] skipped ${f}: ${e.message}`);
    }
  }
} catch (e) {
  console.warn(`[photo-thumbs] disabled: ${e.message}`);
}
writeFileSync(MANIFEST, JSON.stringify(ready.sort(), null, 0) + "\n");
console.log(`[photo-thumbs] ${ready.length} thumbnails ready`);
