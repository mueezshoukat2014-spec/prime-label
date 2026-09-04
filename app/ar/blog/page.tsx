import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { AR_POSTS } from "@/lib/blog-ar";
import { SITE_URL, BRAND_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مدونة برايم ليبلز — دليل البراندات للّيبل والتغليف",
  description:
    "مقالات عملية بالعربي لأصحاب البراندات: اختيار الليبل، الكميات الذكية، الخامات، الشحن للخليج، وأسرار التغليف الفاخر.",
  alternates: {
    canonical: `${SITE_URL}/ar/blog`,
    languages: {
      ar: `${SITE_URL}/ar/blog`,
      en: `${SITE_URL}/blog`,
      "x-default": `${SITE_URL}/blog`,
    },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/ar/blog`,
    title: "مدونة برايم ليبلز",
    description: "دليل البراندات للّيبل والتغليف — بالعربي.",
    siteName: BRAND_NAME,
    locale: "ar_SA",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: BRAND_NAME }],
  },
};

export default async function ArBlogIndex() {
  const site = await getSiteContent();

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <div dir="rtl" lang="ar" className="notranslate" translate="no">
        <section className="relative overflow-hidden pt-28 pb-16 sm:pt-44 sm:pb-24">
          <div className="pointer-events-none absolute -left-[12%] top-16 h-[420px] w-[420px] rounded-full bg-champagne/8 blur-[150px]" />
          <div className="container-lux relative">
            <Reveal>
              <span className="eyebrow arabic-text">
                <span className="h-px w-8 bg-champagne/60" />
                المدونة
              </span>
              <h1 className="arabic-display mt-5 max-w-3xl text-4xl font-bold leading-[1.25] tracking-tight sm:text-6xl sm:leading-[1.2]">
                دليل البراندات للّيبل <span className="gradient-text">والتغليف</span>
              </h1>
              <p className="arabic-text mt-6 max-w-2xl text-[16px] leading-relaxed text-cream-muted">
                خلاصة خبرتنا اليومية مع مئات البراندات — مقالات عملية تساعدك تتخذ قرارات
                أذكى في الليبل والبطاقات والتغليف.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {AR_POSTS.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.05}>
                  <Link
                    href={`/ar/blog/${p.slug}`}
                    className="group block h-full overflow-hidden rounded-3xl border border-line bg-surface/30 transition-all duration-300 hover:border-champagne/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.cover}
                      alt={p.title}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="p-5">
                      <p className="arabic-text text-[11px] text-cream-dim">
                        {new Date(p.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                      <h2 className="arabic-text mt-2 text-[16px] font-bold leading-relaxed text-cream group-hover:text-champagne">
                        {p.title}
                      </h2>
                      <p className="arabic-text mt-2 text-[13px] leading-relaxed text-cream-muted">
                        {p.excerpt}
                      </p>
                      <span className="arabic-text mt-3 inline-block text-[12.5px] text-champagne">
                        اقرأ المقال ←
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <div className="mt-16 rounded-3xl border border-champagne/25 bg-surface/40 p-8 text-center">
                <h2 className="arabic-display text-2xl font-bold sm:text-3xl">جاهز تبدأ براندك؟</h2>
                <p className="arabic-text mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-cream-muted">
                  تسعيرة مفصلة خلال 24 ساعة مع بروفة رقمية مجانية — أرسل شعارك وخلّ الباقي علينا.
                </p>
                <Link href="/ar/quote" className="btn-primary arabic-text mt-6 inline-flex !py-3.5 px-8 text-[14px] shadow-glow-sm">
                  اطلب تسعيرتك الآن
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
