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
  price: number;
  category: string;
  bundleIds: string[];
  checkoutUrl: string;
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
    price: 9,
    category: "make-money",
    bundleIds: ["starter"],
    checkoutUrl: "#",
    blogSlug: "your-first-100-online",
  },
  {
    id: "zero-to-1k",
    title: "$0 to $1K Per Month (Simple Plan)",
    benefit: "Clear roadmap to consistent income",
    detail:
      "Zero to steady income in order: what to do at each stage and what to decide next.",
    price: 19,
    category: "make-money",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    blogSlug: "zero-to-1k-per-month",
  },
  {
    id: "pricing",
    title: "Pricing Your Digital Products",
    benefit: "Stop guessing your prices",
    detail:
      "Anchoring, tiers, and how to present price so value lands before objections do.",
    price: 9,
    category: "make-money",
    bundleIds: ["starter"],
    checkoutUrl: "#",
    blogSlug: "pricing-your-digital-products",
  },
  {
    id: "not-making-money",
    title: "Why You're Not Making Money Online (Yet)",
    benefit: "Fix what is holding you back",
    detail:
      "Diagnostic for stuck income plus next steps matched to where your gap actually is.",
    price: 9,
    category: "make-money",
    bundleIds: ["starter"],
    checkoutUrl: "#",
    blogSlug: "why-youre-not-making-money-online-yet",
  },
  // Build
  {
    id: "idea-to-pdf",
    title: "Idea to PDF in 24 Hours",
    benefit: "Turn an idea into a product fast",
    detail:
      "Blank page to finished PDF: format choices, writing flow, and what to do after ship.",
    price: 9,
    category: "build",
    bundleIds: ["builder"],
    checkoutUrl: "#",
    blogSlug: "idea-to-pdf-in-24-hours",
  },
  {
    id: "no-coding",
    title: "Build Digital Products Without Coding",
    benefit: "Create products without tech skills",
    detail:
      "Tools by product type, setup walkthrough, idea to live without hiring a developer.",
    price: 19,
    category: "build",
    bundleIds: ["builder"],
    checkoutUrl: "#",
    blogSlug: "build-digital-products-without-coding",
  },
  {
    id: "landing-pages",
    title: "Simple Landing Pages That Convert",
    benefit: "Build pages that actually sell",
    detail:
      "Page structure, copy patterns that work, and mistakes that quietly cost sales.",
    price: 19,
    category: "build",
    bundleIds: ["builder"],
    checkoutUrl: "#",
    blogSlug: "simple-landing-pages-that-convert",
  },
  {
    id: "offer-sells-itself",
    title: "The Offer That Sells Itself",
    benefit: "Make your product easy to buy",
    detail:
      "Offer structure, positioning fixes, and framing work most creators never do.",
    price: 19,
    category: "build",
    bundleIds: ["builder"],
    checkoutUrl: "#",
    blogSlug: "the-offer-that-sells-itself",
  },
  // Sell
  {
    id: "sell-no-audience",
    title: "Sell Without an Audience",
    benefit: "Make sales without followers",
    detail:
      "Channels and tactics that work before you have a following, plus early momentum.",
    price: 9,
    category: "sell",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    blogSlug: "sell-without-an-audience",
  },
  {
    id: "one-page-funnel",
    title: "The One-Page Sales Funnel",
    benefit: "Simple system that converts",
    detail:
      "What to write at each stage, plus a light post-purchase flow without a tech week.",
    price: 19,
    category: "sell",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    blogSlug: "the-one-page-sales-funnel",
  },
  {
    id: "email-list",
    title: "Email List for Creators (Simple Setup)",
    benefit: "Build and use your email list",
    detail:
      "From platform pick to emails that lead to sales, without burning your list out.",
    price: 9,
    category: "sell",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    blogSlug: "email-list-for-creators",
  },
  {
    id: "content-converts",
    title: "Content That Actually Converts",
    benefit: "Create content that leads to sales",
    detail:
      "What to make, how to structure it, and a rhythm that sells without feeling salesy.",
    price: 9,
    category: "sell",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    blogSlug: "content-that-actually-converts",
  },
  // Mindset
  {
    id: "anti-hustle",
    title: "The Anti-Hustle Playbook",
    benefit: "Build without burnout",
    detail:
      "Shape the business so work compounds: decisions that stop endless busywork.",
    price: 9,
    category: "mindset",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    blogSlug: "the-anti-hustle-playbook",
  },
  {
    id: "stop-overthinking",
    title: "Stop Overthinking, Start Shipping",
    benefit: "Take action and finish projects",
    detail:
      "For when you're ready to build but keep finding reasons to wait. Cut the loop.",
    price: 9,
    category: "mindset",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
    blogSlug: "stop-overthinking-start-shipping",
  },
  {
    id: "focus-sloth",
    title: "Focus Like a Sloth",
    benefit: "Stay consistent and focused",
    detail:
      "Consistency without willpower: stay on one thing long enough for it to compound.",
    price: 9,
    category: "mindset",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
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
