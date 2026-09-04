export const SITE_URL = "https://primelabelsintl.com";
export const BRAND_NAME = "Prime Labels International";

/** Google Business Profile review link — customers land directly on the "write a review" box. */
export const GOOGLE_REVIEW_URL = "https://g.page/r/CYZM4--mhJyZEBM/review";

export const GCC_COUNTRIES = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
] as const;

export const DEMAND_MARKETS = [
  ...GCC_COUNTRIES,
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Turkey",
  "Pakistan",
] as const;

export const SEO_PRODUCTS = [
  "custom woven labels",
  "satin clothing labels",
  "printed fabric labels",
  "hang tags",
  "thank you cards",
  "business cards",
  "custom stickers",
  "packaging sleeves",
  "zipper bags",
  "woven patches",
  "steel logo tags",
  "garment branding accessories",
] as const;

export const ARABIC_KEYWORDS = [
  "ملصقات ملابس مخصصة",
  "ليبل ملابس",
  "بطاقات تعليق للملابس",
  "تغليف براندات الملابس",
  "ستيكرات مخصصة",
  "إكسسوارات براند الملابس",
  "ليبل منسوج",
] as const;

export const PRIMARY_KEYWORDS = [
  "custom woven labels Saudi Arabia",
  "clothing labels Saudi Arabia",
  "hang tags Saudi Arabia",
  "custom packaging Saudi Arabia",
  "custom woven labels UAE",
  "clothing labels Dubai",
  "garment labels Qatar",
  "hang tags Kuwait",
  "brand packaging Oman",
  "custom stickers Bahrain",
  "apparel branding accessories GCC",
  "custom clothing labels Middle East",
  "woven labels for fashion brands",
  "premium clothing labels supplier",
  ...SEO_PRODUCTS,
  ...ARABIC_KEYWORDS,
] as const;

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: BRAND_NAME,
  alternateName: "Prime Labels",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  image: `${SITE_URL}/icon.png`,
  description:
    "Premium custom branding studio producing woven labels, satin labels, hang tags, stickers, packaging and garment branding accessories for clothing brands across Saudi Arabia, the GCC and worldwide.",
  sameAs: [
    "https://www.instagram.com/primelabels_intl",
    "https://g.page/r/CYZM4--mhJyZEBM",
  ],
  areaServed: DEMAND_MARKETS.map((name) => ({ "@type": "Country", name })),
  knowsAbout: SEO_PRODUCTS,
  slogan: "Every great brand starts with a label.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    availableLanguage: ["English", "Arabic"],
    areaServed: "Worldwide",
  },
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: BRAND_NAME,
  alternateName: "Prime Labels",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: ["en", "ar"],
};

export const offerCatalogJsonLd = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  "@id": `${SITE_URL}/#offer-catalog`,
  name: "Custom clothing label and packaging products",
  itemListElement: SEO_PRODUCTS.map((name) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name,
      areaServed: DEMAND_MARKETS.map((market) => ({ "@type": "Country", name: market })),
      provider: { "@id": `${SITE_URL}/#organization` },
    },
  })),
};

/** Materials per product slug — feeds Product JSON-LD `material`. */
const PRODUCT_MATERIALS: Record<string, string> = {
  "woven-labels": "High-density damask polyester yarn",
  "satin-labels": "Soft satin polyester",
  "hang-tags": "Premium 300-400 GSM art board",
  "custom-stickers": "Vinyl / matte / transparent adhesive",
  "brand-packaging": "Satin ribbon, textured cardstock, premium kraft / art paper",
  "zipper-bags": "Frosted / matte PE and PVC",
  "woven-patches": "Embroidered polyester twill",
  "steel-logo-tags": "Laser-engraved stainless steel",
};

/**
 * Product JSON-LD for the live catalogue (rendered on the homepage).
 * MOQ is expressed via eligibleQuantity on a custom-quote offer, because
 * every order is custom priced.
 */
export function productsJsonLd(
  products: Array<{
    slug: string;
    title: string;
    tagline?: string;
    description?: string;
    image?: string;
    moq?: number | null;
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/#product-list`,
    name: "Custom garment branding products",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        "@id": `${SITE_URL}/#product-${p.slug}`,
        name: p.title,
        description: p.description || p.tagline || `${p.title} by ${BRAND_NAME}`,
        image: p.image?.startsWith("http") ? p.image : `${SITE_URL}${p.image || "/icon.png"}`,
        brand: { "@id": `${SITE_URL}/#organization` },
        material: PRODUCT_MATERIALS[p.slug],
        url: `${SITE_URL}/quote?product=${encodeURIComponent(p.title)}`,
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/quote?product=${encodeURIComponent(p.title)}`,
          priceCurrency: "USD",
          price: "0",
          priceSpecification: {
            "@type": "PriceSpecification",
            price: "0",
            priceCurrency: "USD",
            description: "Custom quoted per order — tailored quote within 12 hours",
          },
          availability: "https://schema.org/InStock",
          eligibleQuantity: p.moq
            ? { "@type": "QuantitativeValue", minValue: p.moq, unitText: "units" }
            : undefined,
          areaServed: DEMAND_MARKETS.map((m) => ({ "@type": "Country", name: m })),
          seller: { "@id": `${SITE_URL}/#organization` },
        },
      },
    })),
  };
}

/** BreadcrumbList JSON-LD for sub-pages. */
export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: it.name,
        item: `${SITE_URL}${it.path}`,
      })),
    ],
  };
}
