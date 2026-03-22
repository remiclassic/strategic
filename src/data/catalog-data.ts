export type Category = {
  id: string;
  label: string;
  emoji: string;
};

export type Book = {
  id: string;
  title: string;
  /** Short hook under the title */
  benefit: string;
  /** One line on what the guide covers (richer than benefit alone) */
  detail: string;
  /** 2-4 short bullets describing what is actually inside the PDF */
  whatsInside?: string[];
  price: number;
  category: string;
  bundleIds: string[];
  checkoutUrl: string;
  /** Card header art under `/public` */
  coverImage: string;
  /** Blog post slug when a companion article links to this guide on /books */
  blogSlug?: string;
};

export type Bundle = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bookIds: string[];
  price: number;
  anchorPrice: number;
  badge: string;
  cta: string;
  highlighted: boolean;
  checkoutUrl: string;
  coverImage: string;
};

export const categories: Category[] = [
  { id: "make-money", label: "Make Money", emoji: "💰" },
  { id: "build", label: "Build", emoji: "🧰" },
  { id: "sell", label: "Sell", emoji: "📈" },
  { id: "mindset", label: "Mindset", emoji: "🧠" },
];

export const books: Book[] = [
  // Make Money
  {
    id: "first-100",
    title: "Your First $100 Online",
    benefit: "Make your first online income quickly",
    detail:
      "Full path from idea to first sale, including awkward steps most guides skip.",
    whatsInside: [
      "How to pick an idea people will pay for",
      "Where to sell it without a website or audience",
      "The exact steps from zero to first payment",
      "What to do after your first sale to keep it going",
    ],
    price: 9,
    category: "make-money",
    bundleIds: ["starter"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/first-100.png",
    blogSlug: "your-first-100-online",
  },
  {
    id: "zero-to-1k",
    title: "$0 to $1K Per Month (Simple Plan)",
    benefit: "Clear roadmap to consistent income",
    detail:
      "Zero to steady income in order: what to do at each stage and what to decide next.",
    whatsInside: [
      "A stage-by-stage plan from zero to repeatable income",
      "What decisions actually matter at each level",
      "Common bottlenecks and how to move past them",
      "How to build momentum without burning out",
    ],
    price: 19,
    category: "make-money",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/zero-to-1k.png",
    blogSlug: "zero-to-1k-per-month",
  },
  {
    id: "pricing",
    title: "Pricing Your Digital Products",
    benefit: "Stop guessing your prices",
    detail:
      "Anchoring, tiers, and how to present price so value lands before objections do.",
    whatsInside: [
      "Why most creators underprice and how to fix it",
      "Anchoring and tier strategies that work",
      "How to present price so it feels fair, not cheap",
      "Adjusting price over time as you grow",
    ],
    price: 9,
    category: "make-money",
    bundleIds: ["starter"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/pricing.png",
    blogSlug: "pricing-your-digital-products",
  },
  {
    id: "not-making-money",
    title: "Why You're Not Making Money Online (Yet)",
    benefit: "Fix what is holding you back",
    detail:
      "Diagnostic for stuck income plus next steps matched to where your gap actually is.",
    whatsInside: [
      "The most common reasons income stalls",
      "A simple self-audit to find your specific gap",
      "Targeted fixes for each type of problem",
      "How to start moving forward without starting over",
    ],
    price: 9,
    category: "make-money",
    bundleIds: ["starter"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/not-making-money.png",
    blogSlug: "why-youre-not-making-money-online-yet",
  },
  // Build
  {
    id: "idea-to-pdf",
    title: "Idea to PDF in 24 Hours",
    benefit: "Turn an idea into a product fast",
    detail:
      "Blank page to finished PDF: format choices, writing flow, and what to do after ship.",
    whatsInside: [
      "How to go from rough idea to finished PDF in one session",
      "Format and structure decisions that make it feel professional",
      "What to include and what to cut",
      "Steps to take after you ship so it actually sells",
    ],
    price: 9,
    category: "build",
    bundleIds: ["builder"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/idea-to-pdf.png",
    blogSlug: "idea-to-pdf-in-24-hours",
  },
  {
    id: "no-coding",
    title: "Build Digital Products Without Coding",
    benefit: "Create products without tech skills",
    detail:
      "Tools by product type, setup walkthrough, idea to live without hiring a developer.",
    whatsInside: [
      "Which tools to use for each type of digital product",
      "Step-by-step setup without touching code",
      "How to go from idea to live product on your own",
      "Where to host and deliver your product simply",
    ],
    price: 19,
    category: "build",
    bundleIds: ["builder"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/no-coding.png",
    blogSlug: "build-digital-products-without-coding",
  },
  {
    id: "landing-pages",
    title: "Simple Landing Pages That Convert",
    benefit: "Build pages that actually sell",
    detail:
      "Page structure, copy patterns that work, and mistakes that quietly cost sales.",
    whatsInside: [
      "The exact page structure that moves visitors to buyers",
      "Copy patterns you can adapt for your own product",
      "The most common mistakes that quietly kill conversions",
      "How to test and improve without overthinking",
    ],
    price: 19,
    category: "build",
    bundleIds: ["builder"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/landing-pages.png",
    blogSlug: "simple-landing-pages-that-convert",
  },
  {
    id: "offer-sells-itself",
    title: "The Offer That Sells Itself",
    benefit: "Make your product easy to buy",
    detail:
      "Offer structure, positioning fixes, and framing work most creators never do.",
    whatsInside: [
      "What makes an offer feel like an obvious yes",
      "How to position your product so it needs less selling",
      "Framing and context changes that reduce friction",
      "Simple fixes for offers that are getting traffic but not sales",
    ],
    price: 19,
    category: "build",
    bundleIds: ["builder"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/offer-sells-itself.png",
    blogSlug: "the-offer-that-sells-itself",
  },
  // Sell
  {
    id: "sell-no-audience",
    title: "Sell Without an Audience",
    benefit: "Make sales without followers",
    detail:
      "Channels and tactics that work before you have a following, plus early momentum.",
    whatsInside: [
      "Where to find buyers when you have zero following",
      "Tactics that create early sales momentum",
      "How to use communities and platforms without spamming",
      "Building your first small audience alongside your product",
    ],
    price: 9,
    category: "sell",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/sell-no-audience.png",
    blogSlug: "sell-without-an-audience",
  },
  {
    id: "one-page-funnel",
    title: "The One-Page Sales Funnel",
    benefit: "Simple system that converts",
    detail:
      "What to write at each stage, plus a light post-purchase flow without a tech week.",
    whatsInside: [
      "A one-page funnel structure you can set up in a day",
      "What to write at each stage to keep readers moving",
      "A simple post-purchase sequence that builds trust",
      "How to avoid over-engineering it into something you never ship",
    ],
    price: 19,
    category: "sell",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/one-page-funnel.png",
    blogSlug: "the-one-page-sales-funnel",
  },
  {
    id: "email-list",
    title: "Email List for Creators (Simple Setup)",
    benefit: "Build and use your email list",
    detail:
      "From platform pick to emails that lead to sales, without burning your list out.",
    whatsInside: [
      "Which email platform to pick and why",
      "How to grow your list from the first subscriber",
      "What to send so people stay subscribed and buy",
      "A simple email rhythm that sells without feeling pushy",
    ],
    price: 9,
    category: "sell",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/email-list.png",
    blogSlug: "email-list-for-creators",
  },
  {
    id: "content-converts",
    title: "Content That Actually Converts",
    benefit: "Create content that leads to sales",
    detail:
      "What to make, how to structure it, and a rhythm that sells without feeling salesy.",
    whatsInside: [
      "What content formats lead to actual product sales",
      "How to structure posts and videos that build buying intent",
      "A posting rhythm you can actually maintain",
      "The difference between content that builds an audience and content that earns",
    ],
    price: 9,
    category: "sell",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/content-converts.png",
    blogSlug: "content-that-actually-converts",
  },
  // Mindset
  {
    id: "anti-hustle",
    title: "The Anti-Hustle Playbook",
    benefit: "Build without burnout",
    detail:
      "Shape the business so work compounds: decisions that stop endless busywork.",
    whatsInside: [
      "How to design your work so it compounds instead of drains",
      "Decisions that reduce busywork without hurting growth",
      "What to say no to and when",
      "Building a pace you can keep for years, not just weeks",
    ],
    price: 9,
    category: "mindset",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/anti-hustle.png",
    blogSlug: "the-anti-hustle-playbook",
  },
  {
    id: "stop-overthinking",
    title: "Stop Overthinking, Start Shipping",
    benefit: "Take action and finish projects",
    detail:
      "For when you're ready to build but keep finding reasons to wait. Cut the loop.",
    whatsInside: [
      "Why overthinking happens and what actually breaks the loop",
      "A simple decision filter for when you are stuck",
      "How to ship something imperfect and improve from there",
      "Practical prompts to get moving today",
    ],
    price: 9,
    category: "mindset",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/stop-overthinking.png",
    blogSlug: "stop-overthinking-start-shipping",
  },
  {
    id: "focus-sloth",
    title: "Focus Like a Sloth",
    benefit: "Stay consistent and focused",
    detail:
      "Consistency without willpower: stay on one thing long enough for it to compound.",
    whatsInside: [
      "How to pick one thing and stick with it long enough to see results",
      "Systems for consistency that do not rely on motivation",
      "How to protect your focus from distraction and shiny objects",
      "The compounding effect of slow, steady progress",
    ],
    price: 9,
    category: "mindset",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    coverImage: "/images/catalog/focus-sloth.png",
    blogSlug: "focus-like-a-sloth",
  },
];

export const bundles: Bundle[] = [
  {
    id: "starter",
    name: "Starter System",
    tagline: "Best place to start",
    description: "Start from zero and make your first sales.",
    bookIds: ["first-100", "pricing", "not-making-money"],
    price: 19,
    anchorPrice: 57,
    badge: "Best place to start",
    cta: "Get Starter System",
    highlighted: false,
    checkoutUrl: "#",
    coverImage: "/images/catalog/bundle-starter.png",
  },
  {
    id: "builder",
    name: "Builder System",
    tagline: "Most popular",
    description: "Build and launch your first real digital product.",
    bookIds: ["idea-to-pdf", "no-coding", "landing-pages", "offer-sells-itself"],
    price: 49,
    anchorPrice: 120,
    badge: "Most popular",
    cta: "Get Builder System",
    highlighted: true,
    checkoutUrl: "#",
    coverImage: "/images/catalog/bundle-builder.png",
  },
  {
    id: "full-freedom",
    name: "Full Freedom System",
    tagline: "Best value",
    description: "Everything you need to build, sell, and grow a digital product business.",
    bookIds: [
      "first-100", "zero-to-1k", "pricing", "not-making-money",
      "idea-to-pdf", "no-coding", "landing-pages", "offer-sells-itself",
      "sell-no-audience", "one-page-funnel", "email-list", "content-converts",
      "anti-hustle", "stop-overthinking", "focus-sloth",
    ],
    price: 97,
    anchorPrice: 300,
    badge: "Best value",
    cta: "Get Full System",
    highlighted: false,
    checkoutUrl: "#",
    coverImage: "/images/catalog/bundle-full-freedom.png",
  },
];

/** Return the first bundle name a book belongs to (for cross-sell line). */
export function getPrimaryBundle(book: Book): Bundle | undefined {
  return bundles.find((b) => book.bundleIds.includes(b.id));
}

/** Resolve book titles for a given bundle. */
export function getBundleBooks(bundle: Bundle): Book[] {
  return bundle.bookIds.map((id) => books.find((b) => b.id === id)!).filter(Boolean);
}
