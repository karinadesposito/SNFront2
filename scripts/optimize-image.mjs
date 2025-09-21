// scripts/optimize-images.mjs
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC_DIR = path.resolve(__dirname, '../src/assets/originals');
const OUT_DIR = path.resolve(__dirname, '../src/assets/optimized');

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }

async function listImages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const res = path.resolve(dir, e.name);
    if (e.isDirectory()) files.push(...await listImages(res));
    else if (/\.(jpe?g|png)$/i.test(e.name)) files.push(res);
  }
  return files;
}

async function run() {
  await ensureDir(OUT_DIR);
  const files = await listImages(SRC_DIR);
  if (!files.length) { console.log('No se encontraron imágenes en', SRC_DIR); return; }

  for (const inPath of files) {
    const base = path.basename(inPath).replace(/\.(jpe?g|png)$/i, '');
    const outPath = path.join(OUT_DIR, `${base}.webp`);
    const img = sharp(inPath).rotate();
    const meta = await img.metadata();
    const width = meta.width || 0;
    const pipeline = width > 1600 ? img.resize({ width: 1600 }) : img; // máx 1600px
    await pipeline.webp({ quality: 78 }).toFile(outPath);
    console.log('✓', path.relative(OUT_DIR, outPath));
  }
}

run().catch(err => { console.error(err); process.exit(1); });
