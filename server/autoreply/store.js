// Order storage. Upstash Redis over REST in production (UPSTASH_REDIS_REST_URL / _TOKEN, or the KV_REST_API_URL /
// KV_REST_API_TOKEN names that Vercel's Upstash integration creates).
// Without those, a JSON file under .data/ is used so the flow can be tested locally. Never in production.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from './config.js';

const PREFIX = 'ar:';

function upstash() {
  const url = env('UPSTASH_REDIS_REST_URL', env('KV_REST_API_URL'));
  const token = env('UPSTASH_REDIS_REST_TOKEN', env('KV_REST_API_TOKEN'));
  if (!url || !token) return null;
  return async (...command) => {
    const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(command) });
    const body = await res.json();
    if (!res.ok || body.error) throw new Error(`Upstash: ${body.error ?? res.status}`);
    return body.result;
  };
}

// Tiny subset of Redis semantics, enough for this module. Expiry is stored and checked on read.
function fileBackend() {
  if (process.env.VERCEL) throw new Error('UPSTASH_REDIS_REST_URL / KV_REST_API_URL and the matching token must be set in production');
  const file = path.resolve(env('AUTOREPLY_DEV_STORE', '.data/autoreply-dev.json'));
  const load = async () => {
    const data = JSON.parse(await readFile(file, 'utf8').catch(() => '{}'));
    const now = Date.now();
    for (const [k, exp] of Object.entries(data.__exp ?? {})) if (exp < now) { delete data[k]; delete data.__exp[k]; }
    return data;
  };
  const save = async (data) => { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, JSON.stringify(data, null, 2)); };
  const expire = (data, key, seconds) => { data.__exp ??= {}; data.__exp[key] = Date.now() + Number(seconds) * 1000; };
  return async (op, key, ...args) => {
    const data = await load();
    switch (op) {
      case 'GET': return data[key] ?? null;
      case 'SET': {
        const nx = args.includes('NX');
        if (nx && data[key] !== undefined) return null;
        data[key] = args[0];
        const ex = args.indexOf('EX');
        if (ex > 0) expire(data, key, args[ex + 1]);
        await save(data);
        return 'OK';
      }
      case 'DEL': { const had = data[key] !== undefined; delete data[key]; await save(data); return had ? 1 : 0; }
      case 'INCR': data[key] = String(Number(data[key] ?? 0) + 1); await save(data); return Number(data[key]);
      case 'EXPIRE': expire(data, key, args[0]); await save(data); return 1;
      case 'ZADD': { const z = JSON.parse(data[key] ?? '{}'); z[args[1]] = Number(args[0]); data[key] = JSON.stringify(z); await save(data); return 1; }
      case 'ZREM': { const z = JSON.parse(data[key] ?? '{}'); delete z[args[0]]; data[key] = JSON.stringify(z); await save(data); return 1; }
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

/** ttlSeconds is optional; conversations and dedupe keys expire, orders do not. */
export const setJSON = (key, value, ttlSeconds) =>
  ttlSeconds ? cmd('SET', PREFIX + key, JSON.stringify(value), 'EX', String(ttlSeconds)) : cmd('SET', PREFIX + key, JSON.stringify(value));
export const del = (key) => cmd('DEL', PREFIX + key);
export const incr = (key) => cmd('INCR', PREFIX + key);
export const getNumber = async (key) => Number((await cmd('GET', PREFIX + key)) ?? 0);

/** True the first time a key is claimed within ttlSeconds (message dedupe). */
export const claimOnce = async (key, ttlSeconds) => (await cmd('SET', PREFIX + key, '1', 'NX', 'EX', String(ttlSeconds))) === 'OK';

/** Counter that resets after ttlSeconds (rate limits). */
export async function hit(key, ttlSeconds) {
  const n = await cmd('INCR', PREFIX + key);
  if (n === 1) await cmd('EXPIRE', PREFIX + key, String(ttlSeconds));
  return n;
}

export const indexOrder = (id, createdAt) => cmd('ZADD', PREFIX + 'orders', String(Date.parse(createdAt)), id);
/** Newest first. Upstash: ZRANGE key 0 -1 REV. */
export const listOrderIds = () => cmd('ZRANGE', PREFIX + 'orders', '0', '-1', 'REV');

export const indexDraft = (id, at) => cmd('ZADD', PREFIX + 'drafts', String(at), id);
export const unindexDraft = (id) => cmd('ZREM', PREFIX + 'drafts', id);
export const listDraftIds = () => cmd('ZRANGE', PREFIX + 'drafts', '0', '-1', 'REV');
