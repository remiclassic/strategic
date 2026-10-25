// POST /api/autoreply/webhook  (Stripe, signed with STRIPE_WEBHOOK_SECRET)
// Subscribe the endpoint to: checkout.session.completed, checkout.session.async_payment_succeeded,
// checkout.session.async_payment_failed, customer.subscription.deleted.
import { env } from '../../server/autoreply/config.js';
import { emailClient, emailOwner } from '../../server/autoreply/email.js';
import { listOrders, saveOrder, setStatus, stripe, upsertFromSession } from '../../server/autoreply/orders.js';

// Invoices follow the customer's preferred locale. Quebec French clients get French invoices.
const invoiceLocale = { es: 'es-419', en: 'en', fr: 'fr-CA', 'en-CA': 'en-CA' };

async function onPaid(session) {
  const order = await upsertFromSession(session);
  if (order.status !== 'paid' && order.status !== 'onboarding') return order;
  if (!order.flags.paidEmails) {
    order.flags.paidEmails = true;
    await saveOrder(order);
    if (order.stripeCustomerId) {
      await stripe().customers.update(order.stripeCustomerId, { preferred_locales: [invoiceLocale[order.locale]] }).catch((e) => console.error('[autoreply] locale', e.message));
    }
    await Promise.all([emailClient('paid', order), emailOwner('New paid order', order)]);
  }
  return order;
}

export async function POST(request) {
  const secret = env('STRIPE_WEBHOOK_SECRET');
  if (!secret) return new Response('webhook not configured', { status: 500 });
  const raw = await request.text();
  let event;
  try {
    event = await stripe().webhooks.constructEventAsync(raw, request.headers.get('stripe-signature') ?? '', secret);
  } catch (error) {
    return new Response(`invalid signature: ${error.message}`, { status: 400 });
  }

  const object = event.data.object;
  if (event.type.startsWith('checkout.session.') && object.metadata?.offer !== 'autoreply') return new Response('ignored');

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // OXXO sessions complete before the voucher is paid; they stay "awaiting_payment" until the async event.
        await (object.payment_status === 'unpaid' ? upsertFromSession(object) : onPaid(object));
        break;
      case 'checkout.session.async_payment_succeeded':
        await onPaid(object);
        break;
      case 'checkout.session.async_payment_failed': {
        const order = await upsertFromSession(object);
        await saveOrder(setStatus(order, 'payment_failed', 'stripe'));
        break;
      }
      case 'customer.subscription.deleted': {
        if (object.metadata?.offer !== 'autoreply') break;
        const order = (await listOrders()).find((o) => o.stripeSubscriptionId === object.id);
        if (order) {
          await saveOrder(setStatus(order, 'cancelled', 'stripe'));
          await emailOwner('Subscription cancelled', order);
        }
        break;
      }
    }
  } catch (error) {
    console.error('[autoreply] webhook', event.type, error);
    return new Response('handler error', { status: 500 }); // Stripe retries
  }
  return new Response('ok');
}
