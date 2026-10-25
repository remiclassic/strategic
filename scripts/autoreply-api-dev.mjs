// Local runner for the /api/autoreply/* Vercel functions: `npm run dev:api` (port 8787).
// Reads .env.local if present. Pair it with `PUBLIC_AUTOREPLY_API=http://127.0.0.1:8787 npm run dev`.
// `node scripts/autoreply-api-dev.mjs --seed` also writes test orders to the local file store (no Stripe needed).
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');
process.env.ALLOWED_ORIGINS ??= 'http://127.0.0.1:4321,http://localhost:4321';
process.env.SITE_URL ??= 'http://127.0.0.1:4321';
const port = Number(process.env.PORT ?? 8787);

if (process.argv.includes('--seed')) {
  const { upsertFromSession } = await import('../server/autoreply/orders.js');
  for (const [locale, plan] of [['es', 'bookings'], ['en', 'basic'], ['fr', 'bookings'], ['en-CA', 'complete']]) {
    const id = `cs_test_devseed${locale.replace('-', '')}000000000000`;
    await upsertFromSession({
      id, payment_status: 'paid', currency: locale === 'fr' || locale === 'en-CA' ? 'cad' : 'mxn', amount_total: 0,
      metadata: { offer: 'autoreply', locale, plan, pilot: plan === 'bookings' ? '1' : '0', method: 'card' },
      customer_details: { email: 'test@example.com', name: 'Test' }, custom_fields: [],
    });
    console.log(`seeded ${id}  ->  onboarding ?session_id=${id}`);
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const match = url.pathname.match(/^\/api\/autoreply\/([a-z-]+)\/?$/);
  const file = match && path.resolve('api/autoreply', `${match[1]}.js`);
  if (!file || !existsSync(file)) { res.writeHead(404).end('not found'); return; }
  const mod = await import(pathToFileURL(file).href);
  const handler = mod[req.method];
  if (!handler) { res.writeHead(405).end('method not allowed'); return; }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const request = new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
  try {
    const response = await handler(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    res.writeHead(500).end('error');
  }
}).listen(port, '127.0.0.1', () => console.log(`autoreply API on http://127.0.0.1:${port}`));
