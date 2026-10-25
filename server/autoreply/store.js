// Order storage. Upstash Redis over REST in production (UPSTASH_REDIS_REST_URL / _TOKEN).
// Without those, a JSON file under .data/ is used so the flow can be tested locally. Never in production.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from './config.js';

const PREFIX = 'ar:';

function upstash() {
  const url = env('UPSTASH_REDIS_REST_URL');
  const token = env('UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) return null;
  return async (...command) => {
    const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(command) });
    const body = await res.json();
    if (!res.ok || body.error) throw new Error(`Upstash: ${body.error ?? res.status}`);
    return body.result;
  };
}

// Tiny subset of Redis semantics, enough for this module.
function fileBackend() {
  if (process.env.VERCEL) throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in production');
  const file = path.resolve(env('AUTOREPLY_DEV_STORE', '.data/autoreply-dev.json'));
  const load = async () => JSON.parse(await readFile(file, 'utf8').catch(() => '{}'));
  const save = async (data) => { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, JSON.stringify(data, null, 2)); };
  return async (op, key, ...args) => {
    const data = await load();
    switch (op) {
      case 'GET': return data[key] ?? null;
      case 'SET': data[key] = args[0]; await save(data); return 'OK';
      case 'INCR': data[key] = String(Number(data[key] ?? 0) + 1); await save(data); return Number(data[key]);
      case 'ZADD': { const z = JSON.parse(data[key] ?? '{}'); z[args[1]] = Number(args[0]); data[key] = JSON.stringify(z); await save(data); return 1; }
      case 'ZRANGE': { const z = JSON.parse(data[key] ?? '{}'); return Object.entries(z).sort((a, b) => b[1] - a[1]).map(([m]) => m); }
      default: throw new Error(`dev store: unsupported ${op}`);
    }
  };
}

let backend;
const cmd = (...args) => (backend ??= upstash() ?? fileBackend())(...args);

export async function getJSON(key) {
  const raw = await cmd('GET', PREFIX + key);
  return raw ? JSON.parse(raw) : null;
}

export const setJSON = (key, value) => cmd('SET', PREFIX + key, JSON.stringify(value));
export const incr = (key) => cmd('INCR', PREFIX + key);
export const getNumber = async (key) => Number((await cmd('GET', PREFIX + key)) ?? 0);

export const indexOrder = (id, createdAt) => cmd('ZADD', PREFIX + 'orders', String(Date.parse(createdAt)), id);
/** Newest first. Upstash: ZRANGE key 0 -1 REV. */
export const listOrderIds = () => cmd('ZRANGE', PREFIX + 'orders', '0', '-1', 'REV');
