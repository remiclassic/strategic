export type Category = {
  id: string;
  label: string;
  emoji: string;
};

export type Book = {
  id: string;
  title: string;
  benefit: string;
  price: number;
  category: string;
  bundleIds: string[];
  checkoutUrl: string;
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
    price: 9,
    category: "make-money",
    bundleIds: ["starter"],
    checkoutUrl: "#",
  },
  {
    id: "zero-to-1k",
    title: "$0 to $1K Per Month (Simple Plan)",
    benefit: "Clear roadmap to consistent income",
    price: 19,
    category: "make-money",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
  },
  {
    id: "pricing",
    title: "Pricing Your Digital Products",
    benefit: "Stop guessing your prices",
    price: 9,
    category: "make-money",
    bundleIds: ["starter"],
    checkoutUrl: "#",
  },
  {
    id: "not-making-money",
    title: "Why You're Not Making Money Online (Yet)",
    benefit: "Fix what is holding you back",
    price: 9,
    category: "make-money",
    bundleIds: ["starter"],
    checkoutUrl: "#",
  },
  // Build
  {
    id: "idea-to-pdf",
    title: "Idea to PDF in 24 Hours",
    benefit: "Turn an idea into a product fast",
    price: 9,
    category: "build",
    bundleIds: ["builder"],
    checkoutUrl: "#",
  },
  {
    id: "no-coding",
    title: "Build Digital Products Without Coding",
    benefit: "Create products without tech skills",
    price: 19,
    category: "build",
    bundleIds: ["builder"],
    checkoutUrl: "#",
  },
  {
    id: "landing-pages",
    title: "Simple Landing Pages That Convert",
    benefit: "Build pages that actually sell",
    price: 19,
    category: "build",
    bundleIds: ["builder"],
    checkoutUrl: "#",
  },
  {
    id: "offer-sells-itself",
    title: "The Offer That Sells Itself",
    benefit: "Make your product easy to buy",
    price: 19,
    category: "build",
    bundleIds: ["builder"],
    checkoutUrl: "#",
  },
  // Sell
  {
    id: "sell-no-audience",
    title: "Sell Without an Audience",
    benefit: "Make sales without followers",
    price: 9,
    category: "sell",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
  },
  {
    id: "one-page-funnel",
    title: "The One-Page Sales Funnel",
    benefit: "Simple system that converts",
    price: 19,
    category: "sell",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
  },
  {
    id: "email-list",
    title: "Email List for Creators (Simple Setup)",
    benefit: "Build and use your email list",
    price: 9,
    category: "sell",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
  },
  {
    id: "content-converts",
    title: "Content That Actually Converts",
    benefit: "Create content that leads to sales",
    price: 9,
    category: "sell",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
  },
  // Mindset
  {
    id: "anti-hustle",
    title: "The Anti-Hustle Playbook",
    benefit: "Build without burnout",
    price: 9,
    category: "mindset",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
  },
  {
    id: "stop-overthinking",
    title: "Stop Overthinking, Start Shipping",
    benefit: "Take action and finish projects",
    price: 9,
    category: "mindset",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
  },
  {
    id: "focus-sloth",
    title: "Focus Like a Sloth",
    benefit: "Stay consistent and focused",
    price: 9,
    category: "mindset",
    bundleIds: ["full-freedom"],
    checkoutUrl: "#",
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
