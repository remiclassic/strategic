/**
 * Export a local HTML file to PDF using Chrome or Edge headless (--print-to-pdf).
 * Tries every installed Chromium-based browser if the first attempt fails.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const BROWSER_CANDIDATES = [
  path.join(process.env.PROGRAMFILES || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
    : '',
  path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  path.join(process.env.PROGRAMFILES || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
].filter(Boolean);

export function findHeadlessBrowser() {
  for (const p of BROWSER_CANDIDATES) {
    if (existsSync(p)) return p;
  }
  return null;
}

function allInstalledBrowsers() {
  const seen = new Set();
  const out = [];
  for (const p of BROWSER_CANDIDATES) {
    if (p && existsSync(p) && !seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runOnce(browser, htmlPath, pdfPath) {
  const fileUrl = pathToFileURL(htmlPath).href.replace(/'/g, '%27');
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    fileUrl,
  ];

  await new Promise((resolve, reject) => {
    const child = spawn(browser, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    let stderr = '';
    child.stderr?.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Browser exited with code ${code}. ${stderr.slice(-2000)}`));
        return;
      }
      resolve();
    });
  });

  for (let i = 0; i < 40; i++) {
    if (existsSync(pdfPath)) {
      const s = await stat(pdfPath);
      if (s.size > 0) return;
    }
    await sleep(250);
  }
  throw new Error('PDF was not written or is empty.');
}

/**
 * @param {string} htmlPath absolute path to .html
 * @param {string} pdfPath absolute path for output .pdf (overwritten)
 * @param {{ browserPath?: string }} [opts]
 */
export async function exportHtmlToPdf(htmlPath, pdfPath, opts = {}) {
  const tryList = opts.browserPath ? [opts.browserPath] : allInstalledBrowsers();
  if (tryList.length === 0) {
    throw new Error('No Chrome or Edge found for headless PDF export.');
  }

  let lastErr;
  for (const browser of tryList) {
    try {
      await runOnce(browser, htmlPath, pdfPath);
      return;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}
