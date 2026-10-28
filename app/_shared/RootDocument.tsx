import TabAttention from "@/components/TabAttention";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import LeadCapture from "@/components/LeadCapture";
import FloatingLanguage from "@/components/FloatingLanguage";
import SuggestionBox from "@/components/SuggestionBox";
import { ToastProvider } from "@/components/Toast";
import AnnouncementBar from "@/components/AnnouncementBar";
import MetaPixelRouteTracker from "@/components/MetaPixel";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { getSiteContent } from "@/lib/data";
import { BRAND_NAME, organizationJsonLd, websiteJsonLd, offerCatalogJsonLd, localBusinessJsonLd } from "@/lib/seo";

/**
 * Builds the site-wide JSON-LD graph.
 *
 * This used to be a module-level constant, with a SECOND Organization node
 * emitted in <body> carrying the admin overrides. Both nodes shared the same
 * @id (`/#organization`) but could disagree on `name` and `slogan`, so every page
 * shipped two conflicting definitions of the same entity and Google had to guess
 * which was authoritative. One node now, built after site content is loaded.
 */
function buildGlobalJsonLd(site: { businessName?: string | null; heroHeadline?: string | null }) {
  return [
    {
      ...organizationJsonLd,
      name: site.businessName || BRAND_NAME,
      slogan: site.heroHeadline,
    },
    websiteJsonLd,
    offerCatalogJsonLd,
    localBusinessJsonLd,
  ];
}

const META_PIXEL_ID = "1554256332856113";

/**
 * English pages are static (served from the edge cache), so the server can no
 * longer read cookies/geo per visit. This tiny blocking script runs before
 * first paint and applies the same rule the server used to: a manual choice
 * (pl_lang_pref) wins; otherwise a stored choice (pl_lang, primed by the
 * middleware for Arabic-region visitors) or an Arabic region / browser
 * language opens the page in Arabic (rtl) for Google Translate mode.
 * Native /ar pages have their own root layout with lang="ar" in the HTML.
 */
const LANG_INIT_SCRIPT = `(function(){try{var d=document.documentElement,p=location.pathname;if(p.indexOf('/admin')===0)return;var c=document.cookie,g=function(n){var m=c.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return m?decodeURIComponent(m[1]):''};var pref=g('pl_lang_pref'),stored=g('pl_lang'),cc=g('pl_country').toUpperCase();var AR=' AE BH DJ DZ EG IQ JO KW LB LY MA MR OM PS QA SA SD SO SY TN YE KM ';var langs=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'']).join(',');var auto=(cc&&AR.indexOf(' '+cc+' ')>-1)||/(^|,)\\s*ar(-|;|,|$)/i.test(langs);if(pref==='ar'||(!pref&&(stored==='ar'||auto))){d.lang='ar';d.dir='rtl';d.setAttribute('data-lang','ar')}}catch(e){}})();`;

export default async function RootDocument({
  lang,
  fontClassName,
  children,
}: {
  lang: "en" | "ar";
  /** next/font variable classes (each root layout imports its own fonts so preloads stay scoped). */
  fontClassName: string;
  children: React.ReactNode;
}) {
  const s = await getSiteContent();
  const isAr = lang === "ar";

  return (
    <html
      lang={lang}
      dir={isAr ? "rtl" : "ltr"}
      data-lang={lang}
      className={fontClassName}
      suppressHydrationWarning
    >
      <head>
        {!isAr && <script id="pl-lang-init" dangerouslySetInnerHTML={{ __html: LANG_INIT_SCRIPT }} />}
        <meta name="google-site-verification" content="ZSEoUgZtRotzOKKlF9dBnpJBwRd2bFtDAfKHA3tPrJc" />
        {/* Font preloads come from next/font automatically now that pages are
            static (hardcoded hashes went stale whenever Google updated a font). */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildGlobalJsonLd(s)) }} />

        {/* Pixel preconnects removed: the analytics scripts now load ~5s after
            window load (or on first interaction), so warming those sockets
            during the critical path only wasted early-connection budget. */}
        {/* Google Ads tag (AW-18430949817) — deferred like the Meta Pixel:
            events queue immediately, the network script loads on first
            interaction or ~5s after window load, so LCP/TBT are unaffected.
            EXCEPTION — ad clicks (gclid/gbraid/wbraid in the URL) load it
            immediately: gtag reads the click ID from the URL when it runs,
            and a fast tap on a CTA client-side-navigates away (stripping the
            query string) before a deferred script would execute, which
            would lose the click → conversion attribution. */}
        <script
          id="google-ads-base"
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js',new Date());
gtag('config','AW-18430949817',{send_page_view:true});
(function(){var loaded=0;var go=function(){if(loaded)return;loaded=1;
var t=document.createElement('script');t.async=true;
t.src='https://www.googletagmanager.com/gtag/js?id=AW-18430949817';
var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(t,s)};
if(/[?&](gclid|gbraid|wbraid)=/.test(location.search)){go();return}
if(document.readyState==='complete'){setTimeout(go,5000)}
else{window.addEventListener('load',function(){setTimeout(go,5000)},{once:true})}
['pointerdown','keydown','touchstart','scroll'].forEach(function(ev){
window.addEventListener(ev,go,{once:true,passive:true})});})();`,
          }}
        />
        <link rel="preconnect" href="https://pf7ehmyjhm559fb0.public.blob.vercel-storage.com" crossOrigin="anonymous" />
        {META_PIXEL_ID && (
          <script
            id="meta-pixel-base"
            dangerouslySetInnerHTML={{
              __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
f.__plLoadPixel=function(){if(f.__plPixelLoaded)return;f.__plPixelLoaded=1;
t=b.createElement(e);t.async=!0;t.src=v;
s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('set', 'autoConfig', false, '${META_PIXEL_ID}');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
(function(){var go=function(){window.__plLoadPixel&&window.__plLoadPixel()};
if(document.readyState==='complete'){setTimeout(go,5000)}
else{window.addEventListener('load',function(){setTimeout(go,5000)},{once:true})}
['pointerdown','keydown','touchstart','scroll'].forEach(function(ev){
window.addEventListener(ev,go,{once:true,passive:true})});})();`,
            }}
          />
        )}

      </head>
      <body>
        {/* The legacy <noscript> 1x1 Meta pixel image was removed: Next was
            hoisting it into a <link rel="preload" as="image">, forcing every
            visitor to open a request to facebook.com inside the critical
            path. JS-disabled visitors are an edge case not worth that cost. */}
        <ToastProvider>
          <MetaPixelRouteTracker />
          <AnalyticsTracker />
          <AnnouncementBar
            text={
              String(s.announcementEnabled) === "true"
                ? String(s.announcementText || "").trim()
                : ""
            }
          />
          <TabAttention />
          {children}
          <FloatingLanguage />
          <SuggestionBox />
          <FloatingWhatsApp href={s.whatsapp} />
          <LeadCapture whatsapp={s.whatsapp} />
        </ToastProvider>
      </body>
    </html>
  );
}
