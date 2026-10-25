// GET /api/autoreply/order?session_id=cs_...   the client's order and saved onboarding answers
// PUT /api/autoreply/order  { session_id, step, data, submit? }   saves progress; submit sends it for review
import { emailClient, emailOwner } from '../../server/autoreply/email.js';
import { fail, httpError, json, preflight, readBody, sessionIdFrom } from '../../server/autoreply/http.js';
import { orderForSession, publicOrder, saveOrder, setStatus } from '../../server/autoreply/orders.js';

const SECTIONS = ['business', 'whatsapp', 'answers', 'booking', 'sms', 'consent', 'review'];
const EDITABLE = ['paid', 'onboarding', 'ready_for_review'];

/** Keeps only known sections and plain JSON values, so nothing odd ends up in the record. */
export function cleanOnboarding(data) {
  if (!data || typeof data !== 'object') throw httpError(400, 'invalid_data');
  const out = {};
  for (const key of SECTIONS) {
    if (data[key] !== undefined) out[key] = JSON.parse(JSON.stringify(data[key], (_, v) => (typeof v === 'string' ? v.slice(0, 4000) : v)));
  }
  return out;
}

export const OPTIONS = preflight;

export async function GET(request) {
  try {
    const id = sessionIdFrom(new URL(request.url).searchParams.get('session_id'));
    return json(request, publicOrder(await orderForSession(id)));
  } catch (error) {
    return fail(request, error);
  }
}

export async function PUT(request) {
  try {
    const body = await readBody(request);
    const order = await orderForSession(sessionIdFrom(body.session_id));
    if (!EDITABLE.includes(order.status)) throw httpError(409, `not_editable_${order.status}`);
    order.onboarding = { ...order.onboarding, ...cleanOnboarding(body.data) };
    order.onboardingStep = Number(body.step) || order.onboardingStep || 0;
    if (order.status === 'paid') setStatus(order, 'onboarding', 'client');
    if (order.onboarding.business?.name && !order.businessName) order.businessName = order.onboarding.business.name;

    if (body.submit) {
      if (!order.onboarding.consent?.privacy) throw httpError(422, 'consent_required');
      if (!order.onboarding.review?.approved) throw httpError(422, 'approval_required');
      const first = order.status !== 'ready_for_review';
      order.submittedAt = new Date().toISOString();
      setStatus(order, 'ready_for_review', 'client');
      await saveOrder(order);
      await Promise.all([
        emailOwner(first ? 'Onboarding ready for review' : 'Onboarding updated', order),
        first ? emailClient('submitted', order) : null,
      ]);
    } else {
      await saveOrder(order);
    }
    return json(request, publicOrder(order));
  } catch (error) {
    return fail(request, error);
  }
}
