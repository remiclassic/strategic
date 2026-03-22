/**
 * Batch-export each book folder under "Strategic Sloth books/Single Books" to PDF,
 * then copy PDFs into bundle folders (Starter / Builder / Full Freedom).
 */
import { copyFile, mkdir, readdir, readFile, stat, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { exportHtmlToPdf, findHeadlessBrowser } from './export-html-to-pdf.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
/** Mirror inside the repo so PDFs/bundles show up in Cursor’s file tree. */
const BOOKS_MIRROR_ROOT = path.join(SCRIPT_DIR, '..', 'book-exports');

/**
 * Resolves where "Strategic Sloth books" lives. Checks OneDrive-backed Documents
 * so exports are not written to an empty folder while you look elsewhere.
 */
function resolveBooksRoot() {
  if (process.env.STRATEGIC_SLOTH_BOOKS_ROOT) {
    return process.env.STRATEGIC_SLOTH_BOOKS_ROOT;
  }
  const NAME = 'Strategic Sloth books';
  const docBases = new Set();
  const homes = [os.homedir(), process.env.USERPROFILE].filter(Boolean);
  for (const h of homes) {
    docBases.add(path.join(h, 'Documents'));
    docBases.add(path.join(h, 'OneDrive', 'Documents'));
    docBases.add(path.join(h, 'OneDrive - Personal', 'Documents'));
  }
  for (const key of ['OneDrive', 'OneDriveConsumer', 'OneDriveCommercial']) {
    const v = process.env[key];
    if (v) docBases.add(path.join(v, 'Documents'));
  }
  for (const base of docBases) {
    const root = path.join(base, NAME);
    if (existsSync(root)) return root;
  }
  return path.join(os.homedir(), 'Documents', NAME);
}

async function readHtmlTitle(htmlPath) {
  try {
    const raw = await readFile(htmlPath, 'utf8');
    const m = raw.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (m) return sanitizePdfBaseName(m[1].replace(/\s+/g, ' ').trim());
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Readable PDF name: prefer main HTML filename (e.g. Don't Do Anything.pdf),
 * else <title>, else folder name.
 */
async function resolvePdfStem(htmlPath, folderName) {
  const stem = path.basename(htmlPath, path.extname(htmlPath));
  if (stem && !/^index$/i.test(stem)) {
    return sanitizePdfBaseName(stem);
  }
  const title = await readHtmlTitle(htmlPath);
  if (title) return title;
  return sanitizePdfBaseName(folderName);
}

/** Folders the user expects under Single Books (for missing-folder reporting). */
const EXPECTED_FOLDERS = [
  '$0 to $1K Per Month (Simple Plan)',
  'Build Digital Products Without Coding',
  'Content That Actually Converts',
  'Email List for Creators (Simple Setup)',
  'Focus Like a Sloth',
  'Idea to PDF in 24 Hours',
  'Pricing Your Digital Products',
  'Simple Landing Pages That Convert',
  'Stop Overthinking, Start Shipping',
  'The Anti-Hustle Playbook',
  'The Offer That Sells Itself',
  'The One-Page Sales Funnel',
  "Why You're Not Making Money Online (Yet)",
  'Your First 100 Online',
];

const STARTER = new Set([
  'Your First 100 Online',
  'Pricing Your Digital Products',
  "Why You're Not Making Money Online (Yet)",
]);

const BUILDER = new Set([
  'Idea to PDF in 24 Hours',
  'Build Digital Products Without Coding',
  'Simple Landing Pages That Convert',
  'The Offer That Sells Itself',
]);

function sanitizePdfBaseName(folderName) {
  return folderName.replace(/[/\\:*?"<>|]/g, '–').replace(/\s+/g, ' ').trim();
}

async function isDirectory(p) {
  try {
    const s = await stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

/** Pick main HTML: index.html if present; else sole .html; else largest .html by size. */
async function findMainHtml(bookDir) {
  const entries = await readdir(bookDir, { withFileTypes: true });
  const htmlFiles = entries
    .filter((e) => e.isFile() && /\.html?$/i.test(e.name))
    .map((e) => path.join(bookDir, e.name));

  if (htmlFiles.length === 0) return null;

  const index = htmlFiles.find((f) => /^index\.html?$/i.test(path.basename(f)));
  if (index) return index;

  if (htmlFiles.length === 1) return htmlFiles[0];

  let best = htmlFiles[0];
  let bestSize = 0;
  for (const f of htmlFiles) {
    const s = await stat(f);
    if (s.size > bestSize) {
      bestSize = s.size;
      best = f;
    }
  }
  return best;
}

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function copyPdfOverwrite(src, dest) {
  await ensureDir(path.dirname(dest));
  await copyFile(src, dest);
}

/** Duplicate PDF into repo `book-exports/` so it appears in the project workspace. */
async function mirrorPdf(srcPdf, relativeSegments) {
  const dest = path.join(BOOKS_MIRROR_ROOT, ...relativeSegments);
  await copyPdfOverwrite(srcPdf, dest);
}

async function removeIfExists(p) {
  if (existsSync(p)) {
    await unlink(p).catch(() => {});
  }
}

async function main() {
  const log = {
    exported: [],
    exportFailures: [],
    missingHtml: [],
    bundleCopies: { starter: [], builder: [], fullFreedom: [] },
    missingExpectedFolders: [],
  };

  const BOOKS_ROOT = resolveBooksRoot();
  const SINGLE_BOOKS = path.join(BOOKS_ROOT, 'Single Books');
  const BUNDLE_STARTER = path.join(BOOKS_ROOT, 'Bundles', 'Starter System');
  const BUNDLE_BUILDER = path.join(BOOKS_ROOT, 'Bundles', 'Builder System');
  const BUNDLE_FULL = path.join(BOOKS_ROOT, 'Bundles', 'Full Freedom System');
  const MIRROR_SINGLE = path.join(BOOKS_MIRROR_ROOT, 'Single Books');
  const MIRROR_BUNDLE_STARTER = path.join(BOOKS_MIRROR_ROOT, 'Bundles', 'Starter System');
  const MIRROR_BUNDLE_BUILDER = path.join(BOOKS_MIRROR_ROOT, 'Bundles', 'Builder System');
  const MIRROR_BUNDLE_FULL = path.join(BOOKS_MIRROR_ROOT, 'Bundles', 'Full Freedom System');

  const browser = findHeadlessBrowser();
  if (!browser) {
    console.error('No Chrome/Edge found. Install Chrome or Edge for headless PDF export.');
    process.exit(1);
  }

  await ensureDir(SINGLE_BOOKS);
  await ensureDir(BUNDLE_STARTER);
  await ensureDir(BUNDLE_BUILDER);
  await ensureDir(BUNDLE_FULL);
  await ensureDir(MIRROR_SINGLE);
  await ensureDir(MIRROR_BUNDLE_STARTER);
  await ensureDir(MIRROR_BUNDLE_BUILDER);
  await ensureDir(MIRROR_BUNDLE_FULL);

  const actualNames = (await readdir(SINGLE_BOOKS, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const actualSet = new Set(actualNames);
  for (const expected of EXPECTED_FOLDERS) {
    if (!actualSet.has(expected)) {
      log.missingExpectedFolders.push(expected);
    }
  }

  for (const folderName of actualNames) {
    const bookDir = path.join(SINGLE_BOOKS, folderName);
    if (!(await isDirectory(bookDir))) continue;

    let htmlPath;
    try {
      htmlPath = await findMainHtml(bookDir);
    } catch (e) {
      log.exportFailures.push({ folder: folderName, error: String(e.message || e) });
      continue;
    }

    if (!htmlPath) {
      log.missingHtml.push(folderName);
      continue;
    }

    const stem = await resolvePdfStem(htmlPath, folderName);
    const pdfName = `${stem}.pdf`;
    const pdfOut = path.join(bookDir, pdfName);
    const legacyPdfName = `${sanitizePdfBaseName(folderName)}.pdf`;

    try {
      // Omit browserPath so each Chrome/Edge install is tried until one works.
      await exportHtmlToPdf(htmlPath, pdfOut);
      log.exported.push({ folder: folderName, html: path.basename(htmlPath), pdf: pdfName });
    } catch (e) {
      log.exportFailures.push({ folder: folderName, error: String(e.message || e) });
      continue;
    }

    if (legacyPdfName !== pdfName) {
      await removeIfExists(path.join(bookDir, legacyPdfName));
      await removeIfExists(path.join(BUNDLE_FULL, legacyPdfName));
      await removeIfExists(path.join(BUNDLE_STARTER, legacyPdfName));
      await removeIfExists(path.join(BUNDLE_BUILDER, legacyPdfName));
      await removeIfExists(path.join(BOOKS_MIRROR_ROOT, 'Single Books', folderName, legacyPdfName));
      await removeIfExists(path.join(BOOKS_MIRROR_ROOT, 'Bundles', 'Full Freedom System', legacyPdfName));
      await removeIfExists(path.join(BOOKS_MIRROR_ROOT, 'Bundles', 'Starter System', legacyPdfName));
      await removeIfExists(path.join(BOOKS_MIRROR_ROOT, 'Bundles', 'Builder System', legacyPdfName));
    }

    try {
      await mirrorPdf(pdfOut, ['Single Books', folderName, pdfName]);
    } catch (e) {
      log.exportFailures.push({
        folder: folderName,
        error: `Workspace mirror (Single Books) failed: ${e.message || e}`,
      });
    }

    const destFull = path.join(BUNDLE_FULL, pdfName);
    try {
      await copyPdfOverwrite(pdfOut, destFull);
      log.bundleCopies.fullFreedom.push(pdfName);
      await mirrorPdf(pdfOut, ['Bundles', 'Full Freedom System', pdfName]);
    } catch (e) {
      log.exportFailures.push({
        folder: folderName,
        error: `Full Freedom copy failed: ${e.message || e}`,
      });
    }

    if (STARTER.has(folderName)) {
      try {
        await copyPdfOverwrite(pdfOut, path.join(BUNDLE_STARTER, pdfName));
        log.bundleCopies.starter.push(pdfName);
        await mirrorPdf(pdfOut, ['Bundles', 'Starter System', pdfName]);
      } catch (e) {
        log.exportFailures.push({
          folder: folderName,
          error: `Starter bundle copy failed: ${e.message || e}`,
        });
      }
    }

    if (BUILDER.has(folderName)) {
      try {
        await copyPdfOverwrite(pdfOut, path.join(BUNDLE_BUILDER, pdfName));
        log.bundleCopies.builder.push(pdfName);
        await mirrorPdf(pdfOut, ['Bundles', 'Builder System', pdfName]);
      } catch (e) {
        log.exportFailures.push({
          folder: folderName,
          error: `Builder bundle copy failed: ${e.message || e}`,
        });
      }
    }
  }

  console.log('\n=== Strategic Sloth — Single Books PDF export summary ===\n');
  console.log('Books root (source HTML + primary PDFs):', path.resolve(BOOKS_ROOT));
  console.log('Single Books:', path.resolve(SINGLE_BOOKS));
  console.log('Bundles (primary):', path.resolve(path.join(BOOKS_ROOT, 'Bundles')));
  console.log('Workspace mirror:', path.resolve(BOOKS_MIRROR_ROOT));
  console.log('(Installs tried if needed: Chrome, then Edge.)');
  console.log('\n--- Exported successfully ---');
  if (log.exported.length === 0) {
    console.log('(none)');
  } else {
    for (const x of log.exported) {
      console.log(`  • ${x.folder} → ${x.pdf} (from ${x.html})`);
    }
  }

  console.log('\n--- PDFs copied to bundle folders ---');
  console.log('Starter System:', log.bundleCopies.starter.length ? log.bundleCopies.starter.join(', ') : '(none)');
  console.log('Builder System:', log.bundleCopies.builder.length ? log.bundleCopies.builder.join(', ') : '(none)');
  console.log(
    'Full Freedom System:',
    log.bundleCopies.fullFreedom.length ? `${log.bundleCopies.fullFreedom.length} file(s)` : '(none)',
  );
  if (log.bundleCopies.fullFreedom.length) {
    for (const p of log.bundleCopies.fullFreedom) console.log(`    ${p}`);
  }

  console.log('\n--- Missing HTML in folder ---');
  if (log.missingHtml.length === 0) {
    console.log('(none)');
  } else {
    for (const f of log.missingHtml) console.log(`  • ${f}`);
  }

  console.log('\n--- Export / copy failures ---');
  if (log.exportFailures.length === 0) {
    console.log('(none)');
  } else {
    for (const f of log.exportFailures) {
      console.log(`  • ${f.folder}: ${f.error}`);
    }
  }

  console.log('\n--- Expected book folders not present under Single Books ---');
  if (log.missingExpectedFolders.length === 0) {
    console.log('(none — all expected folder names exist)');
  } else {
    for (const f of log.missingExpectedFolders) console.log(`  • ${f}`);
  }

  console.log('\nDone.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
