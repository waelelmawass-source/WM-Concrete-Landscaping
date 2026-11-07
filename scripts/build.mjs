// Builds the website into /dist:
//  - copies the site files
//  - finds every photo in /gallery/<service-folder>/, resizes it for the web
//    (full size + thumbnail) and writes dist/gallery.json for the "Our Work" section.
import { readdir, mkdir, writeFile, rm, cp, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const IMG = /\.(jpe?g|png|webp|avif|tiff?|heic|heif)$/i;

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const p of ["index.html", "css", "js", "images"]) {
  await cp(path.join(root, p), path.join(dist, p), { recursive: true })
    .catch(err => console.warn(`! Could not copy ${p}: ${err.message}`));
}

let sharp = null;
try { sharp = (await import("sharp")).default; }
catch { console.warn("! sharp not installed: photos will be copied without resizing (run `npm install`)."); }

const toCaption = file => {
  let s = file.replace(/\.[^.]+$/, "");
  if (/^(img|dsc|dcim|pxl|photo|image|whatsapp|screenshot|\d+$)/i.test(s)) return "";
  s = s.replace(/^\d+[\s_-]+/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return s ? s[0].toUpperCase() + s.slice(1) : "";
};
const slug = s => s.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "photo";

const items = [];
const galleryDir = path.join(root, "gallery");
const folders = (await readdir(galleryDir, { withFileTypes: true }).catch(() => [])).filter(d => d.isDirectory()).map(d => d.name).sort();

for (const cat of folders) {
  const files = (await readdir(path.join(galleryDir, cat)).catch(() => [])).filter(f => IMG.test(f)).sort();
  if (!files.length) continue;
  const outDir = path.join(dist, "gallery", cat);
  await mkdir(outDir, { recursive: true });
  const used = new Set();
  for (const f of files) {
    let base = slug(f); while (used.has(base)) base += "-2"; used.add(base);
    const src = path.join(galleryDir, cat, f);
    try {
      if (sharp) {
        await sharp(src).rotate().resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(outDir, base + ".webp"));
        await sharp(src).rotate().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toFile(path.join(outDir, base + "-thumb.webp"));
        items.push({ category: cat, full: `gallery/${cat}/${base}.webp`, thumb: `gallery/${cat}/${base}-thumb.webp`, caption: toCaption(f) });
      } else {
        const name = base + path.extname(f).toLowerCase();
        await copyFile(src, path.join(outDir, name));
        items.push({ category: cat, full: `gallery/${cat}/${name}`, thumb: `gallery/${cat}/${name}`, caption: toCaption(f) });
      }
    } catch (err) {
      console.warn(`! Skipped ${cat}/${f}: ${err.message} (save it as a .jpg and upload again)`);
    }
  }
}

await writeFile(path.join(dist, "gallery.json"), JSON.stringify(items, null, 1));
console.log(`Built site with ${items.length} gallery photo(s) → dist/`);
