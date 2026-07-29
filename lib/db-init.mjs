// Database schema creation + seed.
// Usage: node lib/db-init.mjs         (create tables + seed defaults)
//        node lib/db-init.mjs --seed  (seed only)
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const DATABASE_URL = readFileSync(".env.local", "utf8")
  .split("DATABASE_URL=")[1]
  .split("\n")[0]
  .trim();

const sql = neon(DATABASE_URL);
const seedOnly = process.argv.includes("--seed");

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    image TEXT,
    gallery JSONB DEFAULT '[]',
    price_from TEXT DEFAULT 'On request',
    moq INTEGER,
    turnaround INTEGER,
    category TEXT,
    active BOOLEAN DEFAULT TRUE,
    sort INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    country TEXT,
    product TEXT,
    quantity TEXT,
    details TEXT,
    artwork_url TEXT,
    artwork_name TEXT,
    status TEXT DEFAULT 'new'
  )`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS artwork_url TEXT`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS artwork_name TEXT`,
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    email TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    replied_at TIMESTAMPTZ
  )`,
  // The table predates these columns, and CREATE TABLE IF NOT EXISTS will not
  // add them to an existing table — so patch them in explicitly.
  `ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new'`,
  `ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ`,
  `CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    order_ref TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    country TEXT,
    product TEXT,
    quantity TEXT,
    details TEXT,
    total TEXT,
    status TEXT DEFAULT 'new'
  )`,
  `CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    country TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    approved BOOLEAN DEFAULT TRUE,
    sort INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
];

const SITE_DEFAULTS = {
  businessName: "Prime Labels International",
  tagline: "Custom Branding Studio",
  heroHeadline: "Every great brand starts with a label.",
  heroSub:
    "High-density woven and satin labels, premium hang tags, custom packaging and finishing details trusted by clothing brands worldwide.",
  bio: "Prime Labels International crafts premium custom branding products, woven labels, hang tags, stickers and packaging for fashion brands around the world.",
  instagram: "https://www.instagram.com/primelabels_intl",
  whatsapp: "https://wa.me/923244999224?text=Hi%2C%20I%20want%20to%20inquire%20about%20an%20order",
  email: "hello@primelabelsintl.com",
  phone: "",
  website: "http://primelabelsintl.com",
  serviceArea: "Worldwide",
  shipping: "Worldwide shipping",
};

const SEED_FAQS = [
  ["What products do you make?", "We produce high-density woven labels, satin labels, printed and fabric labels, hang tags, thank you and business cards, custom stickers, brand packaging, woven patches, and engraved steel logo tags. Anything your clothing brand needs to look finished and premium, we make it."],
  ["What is the minimum order quantity?", "Minimums vary by product. Woven labels typically start at 500 pieces, while stickers, cards and packaging have lower minimums. Share your needs in a quote request and we will recommend the most cost-effective quantity for you."],
  ["Do you ship worldwide?", "Yes. We ship to clients across the globe and have experience exporting to fashion brands in many countries. Shipping is arranged per order based on your location and timeline."],
  ["How do I get a price?", "Tap Customize Your Order, tell us the product, quantity and any design details, and we will reply with a tailored quote. Because every order is custom, pricing depends on quantity, size and finish."],
  ["Can I use my own logo and design?", "Absolutely. Send us your logo or artwork and we will set it up for the right product. If you need help preparing files, we can guide you through it."],
  ["How long does an order take?", "Production usually takes 7 to 14 working days depending on the product and quantity, plus shipping time. Rush options are available. We will confirm timing in your quote."],
];

const SEED_TESTIMONIALS = [
  ["Aisha R.", "Founder", "Indie Clothing Label", "United Kingdom", "The woven labels transformed our garments. The quality feels expensive and our customers notice the difference immediately.", 5],
  ["Marcus T.", "Creative Director", "Streetwear Brand", "United States", "Hang tags and packaging that genuinely look like a luxury house produced them. Consistent quality across every reorder.", 5],
  ["Lena K.", "Owner", "Boutique Studio", "Germany", "Detail is everything to us and Prime Labels delivers. Soft, durable labels and crisp print every single time.", 5],
  ["Daniyal A.", "Brand Manager", "Apparel Company", "United Arab Emirates", "Fast turnaround on international shipping and the stickers and thank you cards finished our packaging perfectly.", 5],
];

async function main() {
  if (!seedOnly) {
    console.log("Creating tables...");
    for (const stmt of SCHEMA) {
      await sql.query(stmt);
    }
    console.log("Tables ready.");
  }

  // Seed site_content
  console.log("Seeding site_content...");
  for (const [k, v] of Object.entries(SITE_DEFAULTS)) {
    await sql`INSERT INTO site_content (key, value) VALUES (${k}, ${v}) ON CONFLICT (key) DO NOTHING`;
  }

  // Seed products from content.json
  console.log("Seeding products...");
  const content = JSON.parse(readFileSync("data/content.json", "utf8"));
  let sort = 0;
  for (const p of content.products) {
    await sql`
      INSERT INTO products (slug, title, tagline, description, image, gallery, price_from, moq, turnaround, category, sort)
      VALUES (${p.slug}, ${p.title}, ${p.tagline}, ${p.description}, ${p.image}, ${JSON.stringify(p.gallery)}, ${p.priceFrom}, ${p.moq ?? null}, ${p.turnaround ?? null}, ${p.slug}, ${sort})
      ON CONFLICT (slug) DO UPDATE SET
        title=EXCLUDED.title, tagline=EXCLUDED.tagline, description=EXCLUDED.description,
        image=EXCLUDED.image, gallery=EXCLUDED.gallery, price_from=EXCLUDED.price_from,
        moq=EXCLUDED.moq, turnaround=EXCLUDED.turnaround
    `;
    sort++;
  }

  // Seed categories
  console.log("Seeding categories...");
  sort = 0;
  const seen = new Set();
  for (const p of content.products) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    await sql`INSERT INTO categories (slug, name, description, sort) VALUES (${p.slug}, ${p.title}, ${p.tagline}, ${sort}) ON CONFLICT (slug) DO NOTHING`;
    sort++;
  }

  // Seed FAQs (only if empty)
  const faqCount = await sql`SELECT COUNT(*)::int AS c FROM faqs`;
  if (faqCount[0].c === 0) {
    console.log("Seeding FAQs...");
    let i = 0;
    for (const [q, a] of SEED_FAQS) {
      await sql`INSERT INTO faqs (question, answer, sort) VALUES (${q}, ${a}, ${i})`;
      i++;
    }
  }

  // Seed testimonials (only if empty)
  const tCount = await sql`SELECT COUNT(*)::int AS c FROM testimonials`;
  if (tCount[0].c === 0) {
    console.log("Seeding testimonials...");
    let i = 0;
    for (const [name, role, company, country, content, rating] of SEED_TESTIMONIALS) {
      await sql`INSERT INTO testimonials (name, role, company, country, content, rating, sort) VALUES (${name}, ${role}, ${company}, ${country}, ${content}, ${rating}, ${i})`;
      i++;
    }
  }

  console.log("\nDone. Seeding complete.");
}
main().catch((e) => {
  console.error("DB init failed:", e.message || e);
  process.exit(1);
});
