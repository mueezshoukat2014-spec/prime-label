import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import QuoteForm from "@/components/QuoteForm";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { parseQuoteProducts } from "@/lib/quote-validation";
import { normalizeWaLink } from "@/lib/whatsapp";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "اطلب تسعيرة — ليبل ملابس وبطاقات وتغليف | برايم ليبلز",
  description:
    "أرسل تصميمك والكمية المطلوبة واحصل على تسعيرة مفصلة خلال 12–24 ساعة مع بروفة رقمية مجانية. شحن DDP سريع للسعودية والخليج والعالم.",
  alternates: {
    canonical: `${SITE_URL}/ar/quote`,
    languages: {
      ar: `${SITE_URL}/ar/quote`,
      en: `${SITE_URL}/quote`,
      "x-default": `${SITE_URL}/quote`,
    },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/ar/quote`,
    title: "اطلب تسعيرة — برايم ليبلز",
    description: "تسعيرة مفصلة خلال 24 ساعة مع بروفة رقمية مجانية.",
    siteName: BRAND_NAME,
    locale: "ar_SA",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: BRAND_NAME }],
  },
};

const AR_POINTS = [
  { t: "تسعير مخصص", d: "السعر حسب منتجك وكميتك بالضبط — بدون أسعار جاهزة مبالغ فيها" },
  { t: "رد سريع", d: "نرد عادة خلال 12 ساعة، وبحد أقصى 24 ساعة" },
  { t: "بروفة قبل الدفع النهائي", d: "بروفة رقمية مجانية — لا إنتاج قبل موافقتك" },
  { t: "شحن عالمي DDP", d: "الجمارك مدفوعة مسبقاً حتى باب منزلك" },
];

export default async function ArQuotePage({
  searchParams,
}: {
  searchParams: { product?: string; details?: string };
}) {
  const site = await getSiteContent();
  const product = searchParams?.product || "";
  const details = searchParams?.details || "";
  const wa = normalizeWaLink(site.whatsapp);
  const waAr = `https://wa.me/${(wa.match(/wa\.me\/(\d+)/) || [])[1] || "923244999224"}?text=${encodeURIComponent(
    product ? `مرحباً، أرغب بطلب تسعيرة لـ ${product}` : "مرحباً، أرغب بطلب تسعيرة"
  )}`;

  const jsonLd = breadcrumbJsonLd([{ name: "اطلب تسعيرة", path: "/ar/quote" }]);

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-40 sm:pb-28">
        <div className="pointer-events-none absolute -left-[10%] top-20 h-[400px] w-[400px] rounded-full bg-champagne/10 blur-[140px]" />
        <div className="container-lux relative">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            {/* Arabic intro column */}
            <div dir="rtl" lang="ar" className="notranslate" translate="no">
              <Reveal>
                <nav aria-label="Breadcrumb" className="arabic-text mb-6 flex flex-wrap items-center gap-2 text-[12px] text-cream-dim">
                  <Link href="/ar" className="transition-colors hover:text-champagne">الرئيسية</Link>
                  <span aria-hidden>/</span>
                  <span className="text-cream-muted">اطلب تسعيرة</span>
                </nav>
                <span className="eyebrow arabic-text">
                  <span className="h-px w-8 bg-champagne/60" />
                  اطلب تسعيرتك
                </span>
                <h1 className="arabic-display mt-5 text-4xl font-bold leading-[1.25] sm:text-5xl">
                  خلّنا نسعّر <span className="gradient-text">براندك.</span>
                </h1>
                <p className="arabic-text mt-5 max-w-md text-[15px] leading-relaxed text-cream-muted">
                  كل طلب مخصص، لذلك كل تسعيرة مخصصة. شاركنا التفاصيل وسنرسل لك سعراً
                  يناسب براندك وكميتك وجدولك الزمني.
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-8 space-y-3">
                  {AR_POINTS.map((p) => (
                    <div key={p.t} className="rounded-2xl border border-line bg-surface/30 p-4">
                      <p className="arabic-text text-[14px] font-semibold text-cream">{p.t}</p>
                      <p className="arabic-text mt-1 text-[12.5px] leading-relaxed text-cream-muted">{p.d}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-8 rounded-2xl border border-champagne/25 bg-champagne/[0.05] p-5">
                  <p className="arabic-text text-[13.5px] font-semibold text-champagne">تفضّل الواتساب؟</p>
                  <p className="arabic-text mt-1.5 text-[12.5px] leading-relaxed text-cream-muted">
                    أرسل تصميمك وكميتك مباشرة على واتساب وسنرد عليك بالعربية.
                  </p>
                  <a
                    href={waAr}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="arabic-text mt-3 inline-flex items-center gap-2 rounded-full border border-champagne/40 bg-champagne/10 px-5 py-2.5 text-[13px] font-medium text-champagne transition-colors hover:bg-champagne/20"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
                    </svg>
                    تواصل واتساب
                  </a>
                </div>
                <p className="arabic-text mt-4 text-[11.5px] leading-relaxed text-cream-dim">
                  ملاحظة: نموذج الطلب أدناه بالإنجليزية — يكفي كتابة اسمك ورقم واتساب
                  واختيار المنتج، ويمكنك كتابة التفاصيل بالعربية في خانة الملاحظات.
                </p>
              </Reveal>
            </div>

            {/* the proven quote form (fields are simple/universal) */}
            <Reveal delay={0.15}>
              <div id="quote-form" className="glass scroll-mt-24 rounded-4xl p-7 sm:scroll-mt-28 sm:p-10">
                <QuoteForm
                  defaultProduct={product}
                  defaultDetails={details}
                  whatsapp={site.whatsapp}
                  productChoices={parseQuoteProducts((site as Record<string, string>).quoteProducts)}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
