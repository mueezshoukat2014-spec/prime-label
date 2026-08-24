import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent, getProducts } from "@/lib/data";
import { normalizeWaLink } from "@/lib/whatsapp";
import { SITE_URL, BRAND_NAME, GCC_COUNTRIES, ARABIC_KEYWORDS } from "@/lib/seo";

export const dynamic = "force-dynamic";

const AR_TITLE = "ليبل ملابس مخصص وبطاقات تعليق وتغليف للبراندات | برايم ليبلز";
const AR_DESC =
  "ليبل منسوج عالي الكثافة، ليبل ساتان، بطاقات تعليق فاخرة، ستيكرات وتغليف كامل لبراندات الملابس في السعودية والإمارات والخليج. أقل كمية 100 قطعة، بروفة رقمية مجانية خلال 24 ساعة، توصيل سريع مع الجمارك مدفوعة.";

export const metadata: Metadata = {
  title: AR_TITLE,
  description: AR_DESC,
  keywords: [...ARABIC_KEYWORDS],
  alternates: {
    canonical: `${SITE_URL}/ar`,
    languages: {
      ar: `${SITE_URL}/ar`,
      en: SITE_URL,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/ar`,
    title: AR_TITLE,
    description: AR_DESC,
    siteName: BRAND_NAME,
    locale: "ar_SA",
    images: [{ url: "/photos/brand-logo.jpg", width: 1200, height: 630, alt: BRAND_NAME }],
  },
};

/** Arabic display names + blurbs per product slug. */
const AR_PRODUCTS: Record<string, { name: string; blurb: string }> = {
  "woven-labels": { name: "ليبل منسوج", blurb: "نسيج داماسك عالي الكثافة، ناعم على البشرة ويتحمل أكثر من 50 غسلة" },
  "satin-labels": { name: "ليبل ساتان", blurb: "الخيار الأول للعبايات والملابس الداخلية — نعومة فائقة بدون حكة" },
  "hang-tags": { name: "بطاقات تعليق", blurb: "كرتون فاخر 300–400 غرام مع ذهبي فويل ونقش بارز" },
  stickers: { name: "ستيكرات مخصصة", blurb: "ستيكرات فينيل ومط وشفاف لإغلاق التغليف وختم البراند" },
  "brand-packaging": { name: "تغليف البراند", blurb: "شرائط ساتان، بطاقات شكر، أختام وأكياس ورقية فاخرة" },
  "zipper-bags": { name: "أكياس بسحّاب", blurb: "أكياس مثلجة (فروستد) بشعارك — تغليف البوتيكات الأنيق" },
  patch: { name: "باتشات منسوجة", blurb: "باتشات تطريز وحياكة للكابات والدنيم والستريت وير" },
  "steel-logo": { name: "شعارات ستيل", blurb: "قطع ستانلس ستيل محفورة بالليزر — لمسة الفخامة النهائية" },
};

const AR_FAQS = [
  {
    q: "كم أقل كمية للطلب؟",
    a: "الليبل المنسوج يبدأ من 100 قطعة فقط — مثالي للبراندات الجديدة. الساتان وبطاقات التعليق تبدأ من 500 قطعة، وكل عرض سعر يوضح شرائح الكميات بالتفصيل.",
  },
  {
    q: "هل توصلون إلى السعودية والخليج؟",
    a: "نعم — شحن سريع خلال 3 إلى 5 أيام إلى الرياض وجدة ودبي وجميع دول الخليج، مع نظام DDP: الجمارك والرسوم مدفوعة مسبقاً ولا توجد أي مفاجآت عند الاستلام.",
  },
  {
    q: "هل أرى التصميم قبل الإنتاج؟",
    a: "دائماً — نرسل لك بروفة رقمية دقيقة خلال 24 ساعة مجاناً، ولا يبدأ الإنتاج إلا بعد موافقتك الكاملة.",
  },
  {
    q: "هل تدعمون الكتابة العربية على الليبل؟",
    a: "بالتأكيد — ننسج ونطبع النصوص العربية والإنجليزية أو الاثنين معاً، بما في ذلك تعليمات العناية، بدون أي تكلفة إضافية للتجهيز.",
  },
  {
    q: "كيف أحصل على السعر؟",
    a: "كل طلب يُسعّر حسب التصميم والكمية والمقاس. أرسل تفاصيلك عبر نموذج الطلب أو واتساب وستصلك تسعيرة مفصلة خلال 12 إلى 24 ساعة.",
  },
];

export default async function ArabicPage() {
  const [site, products] = await Promise.all([getSiteContent(), getProducts()]);
  const wa = normalizeWaLink(site.whatsapp);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${SITE_URL}/ar#page`,
      name: AR_TITLE,
      description: AR_DESC,
      inLanguage: "ar",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: "ar",
      mainEntity: AR_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div dir="rtl" lang="ar" className="notranslate" translate="no">
        {/* hero */}
        <section className="relative overflow-hidden pt-28 pb-14 sm:pt-44 sm:pb-24">
          <div className="pointer-events-none absolute -left-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
          <div className="container-lux relative">
            <Reveal>
              <span className="eyebrow arabic-text">
                <span className="h-px w-8 bg-champagne/60" />
                استوديو براندنج متكامل
              </span>
              <h1 className="arabic-display mt-5 max-w-3xl text-4xl font-bold leading-[1.25] tracking-tight sm:text-6xl sm:leading-[1.2]">
                كل براند عظيم يبدأ <span className="gradient-text">بليبل مميز.</span>
              </h1>
              <p className="arabic-text mt-6 max-w-2xl text-[16px] leading-relaxed text-cream-muted">
                ليبل منسوج عالي الكثافة، ليبل ساتان، بطاقات تعليق فاخرة وتغليف كامل —
                لبراندات الأزياء في السعودية والإمارات وقطر والكويت والبحرين وعُمان وحول العالم.
                أقل كمية 100 قطعة، بروفة مجانية خلال 24 ساعة.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/quote" className="btn-primary !py-3.5 !px-7 text-[13px] shadow-glow-sm">
                  اطلب تسعيرة الآن
                </Link>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-[13px] font-medium text-cream-muted transition-all duration-300 hover:border-champagne/60 hover:text-champagne"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
                  </svg>
                  تواصل واتساب
                </a>
              </div>
              <div className="arabic-text mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[12px] text-cream-dim">
                <span>✦ بروفة رقمية مجانية خلال 24 ساعة</span>
                <span>✦ شحن سريع 3–5 أيام للخليج</span>
                <span>✦ الجمارك مدفوعة مسبقاً DDP</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* products */}
        <section className="relative border-t border-line py-14 sm:py-24">
          <div className="container-lux">
            <Reveal>
              <h2 className="arabic-display text-3xl font-bold leading-snug sm:text-5xl">
                منتجاتنا — <span className="gradient-text">كل ما يحتاجه براندك.</span>
              </h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {(products as any[]).slice(0, 8).map((p, i) => {
                const ar = AR_PRODUCTS[p.slug];
                return (
                  <Reveal key={p.slug} delay={i * 0.04}>
                    <Link
                      href={`/products/${p.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-line transition-all duration-300 hover:border-champagne/40"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={p.image}
                          alt={ar?.name || p.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <p className="arabic-text text-[14px] font-semibold text-cream group-hover:text-champagne">
                          {ar?.name || p.title}
                        </p>
                        {ar?.blurb && (
                          <p className="arabic-text mt-1.5 text-[12px] leading-relaxed text-cream-dim">{ar.blurb}</p>
                        )}
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* process */}
        <section className="relative border-t border-line py-14 sm:py-24">
          <div className="container-lux">
            <Reveal>
              <h2 className="arabic-display text-3xl font-bold leading-snug sm:text-5xl">
                من الفكرة إلى براند <span className="gradient-text">جاهز.</span>
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: "٠١", t: "أرسل تصميمك", d: "شعارك بأي صيغة — AI أو PDF أو حتى صورة واضحة، وفريقنا يجهز الملفات" },
                { n: "٠٢", t: "بروفة خلال 24 ساعة", d: "بروفة رقمية دقيقة مجانية، مع مطابقة الألوان بنظام بانتون" },
                { n: "٠٣", t: "الإنتاج بعد موافقتك", d: "7 إلى 14 يوم عمل بجودة تصدير عالمية وفحص لكل قطعة" },
                { n: "٠٤", t: "توصيل حتى بابك", d: "شحن سريع DDP — الجمارك مدفوعة، بدون أي رسوم مفاجئة" },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i * 0.05}>
                  <div className="h-full rounded-2xl border border-line bg-surface/30 p-6">
                    <span className="display text-4xl text-champagne/50">{s.n}</span>
                    <h3 className="arabic-text mt-3 text-[16px] font-semibold text-cream">{s.t}</h3>
                    <p className="arabic-text mt-2 text-[13px] leading-relaxed text-cream-muted">{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* GCC areas */}
        <section className="relative border-t border-line py-14 sm:py-24">
          <div className="container-lux">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <div>
                  <h2 className="arabic-display text-3xl font-bold leading-snug sm:text-5xl">
                    نخدم براندات <span className="gradient-text">الخليج.</span>
                  </h2>
                  <p className="arabic-text mt-4 text-[14px] leading-relaxed text-cream-muted">
                    من بيوت العبايات في الرياض وجدة إلى براندات الستريت وير في دبي —
                    ننتج بمواصفات تصدير عالمية ونشحن مباشرة إلى بابك.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {["السعودية", "الإمارات", "قطر", "الكويت", "البحرين", "عُمان"].map((c) => (
                      <span key={c} className="arabic-text rounded-full border border-champagne/30 bg-champagne/[0.06] px-4 py-2 text-[13px] text-champagne">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="space-y-3">
                  {[
                    "ليبل ساتان ناعم للعبايات مع نصوص عربية أنيقة",
                    "أطقم براندنج متكاملة — ليبل + بطاقات + أختام + شرائط",
                    "مطابقة ألوان بانتون لهوية براندك بدقة",
                    "شحن موحّد لكل الطلب في صندوق واحد",
                  ].map((t) => (
                    <div key={t} className="flex gap-3 rounded-2xl border border-line bg-surface/30 p-4">
                      <span className="mt-0.5 text-champagne">✦</span>
                      <span className="arabic-text text-[13.5px] leading-relaxed text-cream-muted">{t}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative border-t border-line py-14 sm:py-24">
          <div className="container-lux">
            <Reveal>
              <h2 className="arabic-display text-3xl font-bold leading-snug sm:text-5xl">أسئلة شائعة</h2>
            </Reveal>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {AR_FAQS.map((f, i) => (
                <Reveal key={f.q} delay={i * 0.04}>
                  <div className="rounded-2xl border border-line bg-surface/30 p-5">
                    <h3 className="arabic-text text-[15px] font-semibold text-cream">{f.q}</h3>
                    <p className="arabic-text mt-2 text-[13.5px] leading-relaxed text-cream-muted">{f.a}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* CTA */}
            <Reveal delay={0.1}>
              <div className="mt-12 rounded-3xl border border-champagne/25 bg-surface/40 p-8 text-center sm:p-12">
                <h2 className="arabic-display text-3xl font-bold leading-snug sm:text-4xl">
                  جاهز تبدأ؟ التسعيرة خلال 24 ساعة.
                </h2>
                <p className="arabic-text mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-cream-muted">
                  أرسل تصميمك والكمية المطلوبة — وستصلك تسعيرة مفصلة مع بروفة رقمية مجانية قبل الإنتاج.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
                  <Link href="/quote" className="btn-primary !py-3.5 !px-7 text-[13px] shadow-glow-sm">
                    اطلب تسعيرة الآن
                  </Link>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="arabic-text text-[13px] text-cream-muted underline underline-offset-4 transition-colors hover:text-champagne"
                  >
                    أو تواصل معنا واتساب ←
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
