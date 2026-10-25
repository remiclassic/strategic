# Strategic Sloth Studio

Local rebuild of the tools/game studio and learning library. See [rebuild notes](docs/STUDIO-LEARNING-REBUILD.md) for the route map, preserved commerce, and verification details.

The current preview is the built site at `http://127.0.0.1:4321/`. The earlier plain HTML prototype remains in the parent directory; this folder is the cloned Astro repository.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4321
```

For a production build and checks:

```sh
npm run test:all
```

No deployment has been performed. The original deployment notes below are retained for reference; confirm the active hosting setup before publishing.

---

## 24/7 auto-reply offer (WhatsApp, Messenger, texto)

A self-serve offer: landing page, Stripe checkout, onboarding form, admin list.

| Page | Language | Region and currency |
| --- | --- | --- |
| `/es/whatsapp-autoreply/` | Spanish (main audience) | Mexico, MXN |
| `/whatsapp-autoreply/` | English | Mexico, MXN |
| `/fr/whatsapp-autoreply/` | Quebec French | Quebec, CAD |
| `/ca/whatsapp-autoreply/` | English | Quebec, CAD |

Each page has `onboarding/`, terms and privacy pages next to it. The admin page is `/admin/autoreply/` (noindex, not in the sitemap).

### How it is wired

The site is static (GitHub Pages), so payments and forms run as serverless functions in `api/autoreply/`, deployed on Vercel from this same repo (`vercel.json` already builds the site). Shared server code is in `server/autoreply/`.

| Endpoint | What it does |
| --- | --- |
| `POST /api/autoreply/checkout` | Creates a Stripe Checkout Session and redirects to it |
| `POST /api/autoreply/webhook` | Stripe webhook: marks orders paid, sends emails |
| `GET/PUT /api/autoreply/order` | Onboarding: loads and saves the client's answers, submits for review |
| `POST /api/autoreply/meta-signup` | Stores the WABA ID and phone number ID from Embedded Signup |
| `GET/POST /api/autoreply/admin` | Order list, status changes, bot export (needs `ADMIN_PASSWORD`) |
| `POST /api/autoreply/twilio-missed-call` | Texts back callers who were not answered (Quebec plans) |

Orders are stored in Upstash Redis and keyed by the Checkout Session ID. The `session_id` in the onboarding link is the client's key to their own form.

Order status flow: `awaiting_payment` (OXXO only), then `paid`, `onboarding`, `ready_for_review`, `live`. An order can also end up `payment_failed` or `cancelled`.

### Prices and founding spots

Prices, plans and the founding pilot are in `src/data/autoreply.json`. When a founding spot is taken, lower `pilot.spotsLeft` and redeploy. At `0`, the pilot banner disappears. The API also counts paid pilot orders, so it refuses a fourth pilot checkout even if the JSON is not updated yet. Page copy is in `src/data/whatsapp-autoreply*.ts`.

### Environment variables

Vercel (server, keep secret):

| Variable | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe API key (`sk_test_...` first, then `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the webhook endpoint (`whsec_...`) |
| `STRIPE_PRICE_MXN_BASIC_SETUP`, `STRIPE_PRICE_MXN_BASIC_MONTHLY` | Básico prices |
| `STRIPE_PRICE_MXN_BOOKINGS_SETUP`, `STRIPE_PRICE_MXN_BOOKINGS_MONTHLY` | Reservas prices |
| `STRIPE_PRICE_MXN_COMPLETE_SETUP`, `STRIPE_PRICE_MXN_COMPLETE_MONTHLY` | Completo prices |
| `STRIPE_PRICE_MXN_PILOT_SETUP` | MXN 3,500 founding setup |
| `STRIPE_PRICE_CAD_BASIC_SETUP`, `STRIPE_PRICE_CAD_BASIC_MONTHLY` | Essentiel prices |
| `STRIPE_PRICE_CAD_BOOKINGS_SETUP`, `STRIPE_PRICE_CAD_BOOKINGS_MONTHLY` | Réservations prices |
| `STRIPE_PRICE_CAD_COMPLETE_SETUP`, `STRIPE_PRICE_CAD_COMPLETE_MONTHLY` | Complet prices |
| `STRIPE_PRICE_CAD_PILOT_SETUP` | 350 $ founding setup |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Order storage |
| `RESEND_API_KEY` | Sends the emails. Without it, emails are skipped and logged |
| `RESEND_FROM` | Sender, e.g. `Strategic Sloth <hola@strategicsloth.com>`. The domain must be verified in Resend |
| `NOTIFY_EMAIL` | Where Rémi gets new orders and onboarding submissions |
| `ADMIN_PASSWORD` | Password for `/admin/autoreply/` |
| `SITE_URL` | `https://strategicsloth.com`, used for redirect links |
| `ALLOWED_ORIGINS` | Comma-separated origins allowed to call the API. Defaults to `SITE_URL` |
| `META_APP_ID`, `META_APP_SECRET` | Used to swap the Embedded Signup code for a business token. Optional: without the secret, only the IDs are stored |
| `META_GRAPH_VERSION` | Optional, defaults to `v23.0` |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Missed-call text-back |
| `TWILIO_WEBHOOK_URL` | Optional: the exact public URL Twilio calls, used for signature checks behind proxies |

GitHub Pages build (Actions variables, public):

| Variable | Purpose |
| --- | --- |
| `PUBLIC_AUTOREPLY_API` | Base URL of the Vercel deployment, e.g. `https://strategic-api.vercel.app`. Leave empty if the site itself is served by Vercel |
| `WHATSAPP_NUMBER` | Number for the WhatsApp buttons, digits with country code. Without it, the buttons fall back to `/contact/` |
| `META_APP_ID`, `META_CONFIG_ID` | Turn on the "Connect WhatsApp" button. Without them, the form collects the number and offers a short call instead |

### Stripe setup

1. Create a Stripe account for Strategic Sloth LLC and stay in **test mode**.
2. Put `STRIPE_SECRET_KEY=sk_test_...` in `.env.local`, then run `npm run autoreply:stripe-setup`. It creates one setup product and one monthly product per plan and region, plus the two pilot setup prices, all from `autoreply.json`, and prints the `STRIPE_PRICE_*` lines to paste into Vercel. Run it again after changing a price.
3. Dashboard > Developers > Webhooks: add `https://<vercel-domain>/api/autoreply/webhook` with `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `customer.subscription.deleted`. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
4. Settings > Payment methods: turn on **OXXO** (Mexico). OXXO cannot pay subscriptions in Checkout. So the "Pay the setup at OXXO" button takes the setup fee only. Monthly care for those orders starts from the admin page ("Start monthly care"), which sends invoices.
5. Settings > Emails: turn on customer emails for successful payments and invoices. Invoices follow the customer's language: French for `/fr/` buyers.
6. Test with card `4242 4242 4242 4242`. The pilot takes the setup fee now and the first month as a 30-day trial.
7. Repeat steps 2 and 3 in live mode when ready.

**TODO for the accountant: taxes.** Quebec prices are shown "plus taxes applicables", but nothing computes or collects GST/QST yet, and Mexican IVA is not handled. Decide on registration, then turn on Stripe Tax (`automatic_tax`) or add tax rates. The prices already use `tax_behavior: exclusive`.

### Meta app for WhatsApp Embedded Signup

1. At developers.facebook.com, create an app of type **Business** owned by the Strategic Sloth Meta Business account, and add the **WhatsApp** product.
2. Complete Business Verification for Strategic Sloth and become a Tech Provider (WhatsApp > Partner or Tech Provider onboarding). Embedded Signup for client accounts needs this.
3. Facebook Login for Business > Configurations: create a configuration for **WhatsApp Embedded Signup**, with permissions `whatsapp_business_management` and `whatsapp_business_messaging`. Copy its ID to `META_CONFIG_ID`.
4. Add `strategicsloth.com` to the app domains and to the allowed domains for the JavaScript SDK.
5. Set `META_APP_ID` (both GitHub and Vercel) and `META_APP_SECRET` (Vercel only).
6. The form listens for the `WA_EMBEDDED_SIGNUP` message and posts the WABA ID, phone number ID and code to `/api/autoreply/meta-signup`. The token, when swapped, is stored under `metatoken:<order id>`. It is not shown in the admin page or the export.

Messenger and Instagram for Quebec clients are connected during setup, through the bot platform's own Meta login.

### Twilio (Quebec missed-call texto)

Buy a Canadian number in the client's name (or their subaccount). Set its voice "call status changes" webhook, or the `action` of the `<Dial>` that rings the business, to `https://<vercel-domain>/api/autoreply/twilio-missed-call`. In the admin page, use "Link Twilio number" on the order. Texts only go out for orders marked `live`, and default to French.

### Local testing without Stripe

```sh
npm run dev:api -- --seed          # API on :8787, file store in .data/, four test orders
PUBLIC_AUTOREPLY_API=http://127.0.0.1:8787 npm run build && npm run preview -- --port 4321
```

The seed prints onboarding links such as `/es/whatsapp-autoreply/onboarding/?session_id=cs_test_devseedes000000000000`. Put `ADMIN_PASSWORD=...` in `.env.local` to try the admin page.

### Before going live

- Have a lawyer read the terms and privacy pages (Mexico LFPDPPP, Quebec Law 25, Charter of the French Language).
- Law 25: run a privacy impact assessment before sending Quebec data to US providers (Stripe, Vercel, Upstash, Resend), keep a confidentiality incident register, and publish the governance policy.
- Check Meta's pricing page still matches the "1,000 free service messages a month" line (true as of 2026-10-01).

---

# Strategic Sloth Landing Page

A landing page for the Strategic Sloth business, built with Astro and Tailwind CSS.

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## GitHub Pages Deployment

This site is configured to deploy to GitHub Pages at https://remiclassic.github.io/strategic/

The deployment is automated using GitHub Actions. When changes are pushed to the main branch, the site will be automatically built and deployed.

### Manual Deployment

If you need to manually trigger a deployment:

1. Go to the Actions tab in the GitHub repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Project Structure

- `src/components/` - Astro components
- `src/layouts/` - Layout components
- `src/pages/` - Page components
- `public/` - Static assets

## Features

- 🚀 Built with Astro for optimal performance
- 💅 Styled with Tailwind CSS
- 📱 Fully responsive design
- 🎨 Clean, modern UI with soft shadows and rounded corners
- 💳 Integrated with Lemon Squeezy for payments
- 📦 Static site generation for easy deployment

## Configuration

1. Update the Lemon Squeezy checkout URLs in the following components:
   - `src/components/Pricing.astro`
   - `src/components/Upsell.astro`
   - `src/components/FinalCTA.astro`

2. Customize the content:
   - Update text, images, and pricing in each component
   - Replace placeholder images with your product screenshots
   - Modify colors and styling in the Tailwind classes

## Deployment

The site can be deployed to any static hosting service:

### Netlify
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### GitHub Pages
1. Push your code to GitHub
2. Enable GitHub Pages in your repository settings
3. Set the source to the `gh-pages` branch
4. Add a GitHub Action to build and deploy your site

## License

MIT License - feel free to use this template for your own projects!

## Support

For support, please open an issue in the GitHub repository or contact us at [your-email@example.com]. 