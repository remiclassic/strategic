# Legal and privacy update — September 21, 2026

The three legal notices share one content source (`src/data/legal.ts`) across native dialogs and `/legal/privacy/`, `/legal/terms/`, and `/legal/disclaimer/`. The footer has ordinary links that work without JavaScript, with dialog enhancement when JavaScript is available. Dialogs support keyboard dismissal, focus restoration, and scrolling on small screens. Duplicated cookie/test dialogs and comic styling are removed.

## Confirmed information and corrections

The owner supplied Wyoming registration and the mailing address: 1021 E Lincolnway, 526, Cheyenne, WY 82001, United States. The existing privacy@strategicsloth.com address remains the contact; monitoring of that inbox was not separately confirmed. Confirm that privacy and refund requests reach someone responsible.

The terms preserve the existing 30-day book refund guarantee, identify Lemon Squeezy's role, explain digital delivery and one-time book purchases, permit applying book ideas commercially, and distinguish this from redistributing copyrighted books. Mandatory consumer rights are preserved rather than contradicted by absolute liability exclusions. No arbitration clause, court venue, or retroactive change to purchase rights was invented.

The privacy notice reflects the inspected website: no site account creation; email enquiries; hosted checkout; Google Fonts; optional Google Analytics and Meta Pixel; campaign and checkout browser storage. The notice covers this website, not the separate applications and games.

## Implementation

- Analytics and advertising are independently opt-in and off initially. No unconditional Google Analytics script or Meta noscript beacon renders in the active site layout.
- The browser choice expires after 180 days. Global Privacy Control forces advertising off.
- Google Analytics disables Google signals and ad personalization flags. Meta starts only with advertising consent.
- App attribution and conversion handling starts only if optional measurement is enabled. Rejecting both clears attribution; withdrawal clears accessible matching cookies and reloads to prevent further loading of the disabled vendors.
- Checkout resources remain available for purchases. Provider behavior within checkout is covered by the provider's own notice and was not audited as an independent service.
- Browser tests verify rejection, analytics-only consent, withdrawal, GPC, dialogs, focus return, mobile sizing, and consented purchase tracking. Tests do not submit payments or assert legal compliance.

## Sources consulted

- [Lemon Squeezy buyer terms](https://www.lemonsqueezy.com/buyer-terms): merchant-of-record role and transaction terms.
- [Lemon Squeezy privacy policy](https://www.lemonsqueezy.com/privacy): checkout provider's separate handling.
- [Lemon Squeezy refund documentation](https://docs.lemonsqueezy.com/help/payments/refunds-chargebacks): seller refund policies and provider processing.
- [ICO cookies and similar technologies guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/): transparent choices for optional tracking.
- [FTC consumer privacy guidance](https://www.ftc.gov/business-guidance/privacy-security/consumer-privacy): match published privacy representations to real practices.

## Limits of this review

This is a website content and implementation update, not a legal opinion or certification. Production hosting logs, email-provider arrangements, account-level analytics retention, international transfer arrangements, and actual customer markets were not supplied or independently audited. The notice avoids fabricated retention periods and jurisdiction-specific guarantees. Counsel should assess the final documents against those operations and applicable consumer/privacy requirements before relying on them as complete compliance documentation. Keep the policies aligned when adding accounts, subscriptions, newsletters, or separate app services.

Validation: 66-page build, original 40 article routes and 24 checkout URLs preserved, 12 unit tests and 11 browser tests passed, desktop/mobile visual review completed. Live site not deployed.
