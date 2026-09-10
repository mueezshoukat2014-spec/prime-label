// Static site content compiled from the Instagram scrape.
// The DB (when seeded) overrides these values; this is the always-on fallback.
import contentData from "@/data/content.json";
import profileData from "@/data/raw/profile.json";

export type Product = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  gallery: string[];
  count?: number;
  priceFrom: string;
  moq?: number;
  turnaround?: number;
};

export type GalleryItem = {
  src: string;
  caption: string;
  category: string;
  shortcode: string;
  type: string;
  w?: number;
  h?: number;
};

export type Reel = {
  src: string;
  cover: string;
  caption: string;
  plays: number | null;
  shortcode: string;
  kind?: "local" | "uploaded";
  title?: string;
  product?: string;
};

export type SiteContent = {
  businessName: string;
  tagline: string;
  heroHeadline: string;
  heroSub: string;
  bio: string;
  instagram: string;
  whatsapp: string;
  email: string;
  phone: string;
  website: string;
  followers: number;
  serviceArea: string;
  shipping: string;
  /** Where new quote-request alerts are emailed. */
  notificationEmail: string;
  /** Gold promo bar text; empty hides it. */
  announcementText: string;
  /** "true" shows the promo bar. Stored as a string in site_content. */
  announcementEnabled: string;
  /** JSON array of admin-managed uploaded videos for the video section. */
  managedVideos: string;
};

const profile = (profileData as any[])[0] || {};

export const STATIC_CONTENT = {
  businessName: "Prime Labels International",
  tagline: "Custom Branding Studio",
  heroHeadline: "Every great brand starts with a label.",
  heroSub:
    "High-density woven and satin labels, premium hang tags, custom packaging and finishing details trusted by clothing brands worldwide.",
  bio:
    "Prime Labels International crafts premium custom branding products, woven labels, hang tags, stickers and packaging for fashion brands around the world.",
  instagram: "https://www.instagram.com/primelabels_intl",
  whatsapp: "https://wa.me/923244999224?text=Hi%2C%20I%20want%20to%20inquire%20about%20an%20order",
  email: "primelabelsintl@gmail.com",
  phone: "",
  website: profile.externalUrl || "http://primelabelsintl.com",
  followers: profile.followersCount || 3400,
  serviceArea: "Worldwide",
  shipping: "Worldwide shipping",
  notificationEmail: "primelabelsintl@gmail.com",
  announcementText: "",
  announcementEnabled: "false",
  managedVideos: "[]",
} satisfies SiteContent;

// next/image requires local paths to start with "/", but uploaded
// product/gallery images are absolute Vercel Blob URLs. Preserve absolute
// URLs exactly; only prefix relative local paths.
export const normalizeMediaUrl = (value: string | null | undefined): string => {
  const s = String(value ?? "").trim();
  if (!s) return "";
  if (/^(https?:|data:|blob:)/i.test(s)) return s;
  return s.startsWith("/") ? s : `/${s}`;
};

const lead = normalizeMediaUrl;

export const products = ((contentData as any).products as Product[]).map((p) => ({
  ...p,
  image: lead(p.image),
  gallery: (p.gallery || []).map(lead),
}));
export const gallery = ((contentData as any).gallery as GalleryItem[]).map((g) => ({
  ...g,
  src: lead(g.src),
}));
export const reels = ((contentData as any).reels as Reel[]).map((r) => ({
  ...r,
  src: lead(r.src),
  cover: lead(r.cover),
}));

export const faqs = [
  {
    q: "What products do you make?",
    a: "We produce high-density woven labels, satin labels, printed and fabric labels, hang tags, thank you and business cards, custom stickers, brand packaging, woven patches, and engraved steel logo tags. Anything your clothing brand needs to look finished and premium, we make it.",
  },
  {
    q: "What is the minimum order quantity?",
    a: "Minimums vary by product. Woven labels typically start at 500 pieces, while stickers, cards and packaging have lower minimums. Share your needs in a quote request and we will recommend the most cost-effective quantity for you.",
  },
  {
    q: "Do you ship worldwide?",
    a: "Yes. We ship to clients across the globe and have experience exporting to fashion brands in many countries. Shipping is arranged per order based on your location and timeline.",
  },
  {
    q: "How do I get a price?",
    a: "Tap Customize Your Order, tell us the product, quantity and any design details, and we will reply with a tailored quote. Because every order is custom, pricing depends on quantity, size and finish.",
  },
  {
    q: "Can I use my own logo and design?",
    a: "Absolutely. Send us your logo or artwork and we will set it up for the right product. If you need help preparing files, we can guide you through it.",
  },
  {
    q: "How long does an order take?",
    a: "Production usually takes 7 to 14 working days depending on the product and quantity, plus shipping time. Rush options are available. We will confirm timing in your quote.",
  },
];

export const testimonials = [
  /*
   * Real Google Business Profile reviews, published on the Prime Labels
   * International listing (https://g.page/r/CYZM4--mhJyZEBM). Text is reproduced
   * verbatim — typos included — because altering a customer's words turns a
   * genuine review into a fabricated one.
   *
   * These are DISPLAYED ONLY. They are deliberately not marked up with Review or
   * aggregateRating: Google's self-serving review rule makes LocalBusiness /
   * Organization markup ineligible for review rich results, and the review-snippet
   * guidelines forbid aggregating ratings from other websites. See lib/seo.ts.
   *
   * The admin Testimonials panel writes to the `testimonials` table, which takes
   * priority over this list (see getTestimonials in lib/data.ts). This array is
   * only the fallback when the database is unreachable.
   */
  {
    name: "Mueez Shoukat",
    role: "Verified Google review",
    company: "",
    country: "",
    content:
      "Outstanding experience! Got custom packaging and labels printed from them, and the quality is top-notch. The print sharpness, material, and finishing completely exceeded my expectations. Highly professional service and super fast delivery. 10/10 recommended!",
    rating: 5,
  },
  {
    name: "Muhammad Abdullah",
    role: "Verified Google review",
    company: "",
    country: "",
    content:
      "Outstanding quality and superb craftsmanship from Prime Labels! The labels turned out perfect with exact sizing and vibrant details. Extremely satisfied and highly recommended!",
    rating: 5,
  },
  {
    name: "Lala Rukh",
    role: "Verified Google review",
    company: "Cross&Crafts.pk",
    country: "",
    content:
      "They did very amazing. I was just curious about the labels, design and the perfect color that matches the vibe of Cross&Crafts.pk and they bring it very magically. Very nicely spoken and supportive. Will recommend 100000% to get your anything customized by them \u2764\ufe0f",
    rating: 5,
  },
  {
    name: "Muzamil Zafar",
    role: "Verified Google review",
    company: "",
    country: "",
    content:
      "I recently ordered labels from Prime Labels, and the quality is outstanding! The finishing and printing are top-notch. Fast delivery and excellent service\u2014highly recommended!",
    rating: 5,
  },
  {
    name: "malaika amjad",
    role: "Verified Google review",
    company: "",
    country: "",
    content:
      "I got my order exactly how i want it and tge quality was perfect 10/10, highly recommend",
    rating: 5,
  },
];
