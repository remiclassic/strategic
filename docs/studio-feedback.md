# Studio feedback on latest GitHub source

Base: origin/main at 3f977c4 (fetched October 12, 2026). Branch: codex/studio-feedback. Checkout: website-latest. Earlier website checkout and local edits are preserved. Run npm run dev -- --host 127.0.0.1 --port 4321 here.

Homepage leads with studio services and founder career portfolio using existing project data, then the interactive Services demo, product work, and original publishing. The existing Services layout, live HUD, React component players, case studies, engineering tabs, team, and career credits remain. Engineering examples are in an expandable section; #engines opens it. Learn, merchandise, and UI packs are in secondary navigation. Norman Ascension keeps its current public identity and links.

## Contact delivery

No delivery service is configured yet. Set PUBLIC_CONTACT_ENDPOINT in a local .env file to a verified JSON POST form receiver and restart/rebuild to enable direct submission. The receiver must deliver email, protect against abuse, support this site's origin, and provide any auto-acknowledgment. Until then, the form explicitly offers an email draft; it never reports that handoff as a confirmed submission. Public environment variables must not contain secret API keys.

## Validation

node scripts/verify-studio-redesign.mjs checks desktop/mobile routes, images, portfolio filters, and mocked form success/failure without sending real enquiries. Services regression tests cover input, skins, code tabs, engine pages, case studies, and component players.

Final production build (90 routes), all 39 browser regression tests, 12 tracking unit tests, production tracking verification, and desktop/mobile route/form/filter checks passed. Browser tests used Microsoft Edge locally; deployment uses Chromium. No real enquiry was sent.

