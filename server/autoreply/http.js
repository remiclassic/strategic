// Small helpers shared by the /api/autoreply/* functions.
import { timingSafeEqual } from 'node:crypto';
import { env, siteUrl } from './config.js';

// The static site (GitHub Pages) and the API (Vercel) can live on different origins.
export function corsHeaders(request) {
  const origin = request.headers.get('origin');
  const allowed = env('ALLOWED_ORIGINS', siteUrl()).split(',').map((s) => s.trim());
  if (!origin || !allowed.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

export const preflight = (request) => new Response(null, { status: 204, headers: corsHeaders(request) });

export function json(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...corsHeaders(request) },
  });
}

export function fail(request, error) {
  const status = error?.status ?? 500;
  if (status >= 500) console.error('[autoreply]', error);
  return json(request, { error: error?.code ?? (status >= 500 ? 'server_error' : 'bad_request') }, status);
}

export const httpError = (status, code) => Object.assign(new Error(code), { status, code });

/** Reads JSON or form bodies into a plain object. */
export async function readBody(request, limit = 200_000) {
  const text = await request.text();
  if (text.length > limit) throw httpError(413, 'too_large');
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    try { return JSON.parse(text || '{}'); } catch { throw httpError(400, 'invalid_json'); }
  }
  return Object.fromEntries(new URLSearchParams(text));
}

export function checkAdmin(request) {
  const expected = env('ADMIN_PASSWORD');
  if (!expected) throw httpError(503, 'admin_not_configured');
  const given = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw httpError(401, 'unauthorized');
}

// Checkout session IDs double as the client's onboarding key: unguessable, and only sent to the buyer.
export function sessionIdFrom(value) {
  const id = String(value ?? '');
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(id)) throw httpError(400, 'invalid_session');
  return id;
}
