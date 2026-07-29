export const SITE_URL = "https://primelabelsintl.com";
export const BRAND_NAME = "Prime Labels International";

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
  url: SITE_URL,
  logo: `${SITE_URL}/photos/brand-logo.jpg`,
  image: `${SITE_URL}/photos/brand-logo.jpg`,
  description:
    "Premium custom branding studio producing woven labels, satin labels, hang tags, stickers, packaging and garment branding accessories for clothing brands across Saudi Arabia, the GCC and worldwide.",
  sameAs: ["https://www.instagram.com/primelabels_intl"],
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
