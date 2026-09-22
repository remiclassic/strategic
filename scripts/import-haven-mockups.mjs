import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Run from website/: node scripts/import-haven-mockups.mjs docs/<manifest>.json
const manifestPath = process.argv[2];
if (!manifestPath) throw new Error('Pass a mockup manifest JSON path.');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const originals = 'design/havenworks';
const publicDir = 'public/images/game-ui/havenworks';
await fs.mkdir(originals, { recursive: true });
await fs.mkdir(publicDir, { recursive: true });
for (const image of manifest.images) {
  if (!/^\d{2}-[a-z0-9-]+$/.test(image.slug)) throw new Error('Invalid mockup slug.');
  const png = path.join(originals, `${image.slug}.png`);
  // Preserve existing originals on repeated imports.
  try { await fs.copyFile(image.source, png, fs.constants.COPYFILE_EXCL); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  await sharp(png).webp({ quality: 88 }).toFile(path.join(publicDir, `${image.slug}.webp`));
  await sharp(png).resize({ width: 360 }).webp({ quality: 80 }).toFile(path.join(publicDir, `${image.slug}-thumb.webp`));
}
console.log(`Imported ${manifest.images.length} mockups with thumbnails.`);
