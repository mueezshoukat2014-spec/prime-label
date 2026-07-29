const base = "https://primelabelsintl.com";

type ImageEntry = [path: string, title: string];

const entries: Array<{ loc: string; images: ImageEntry[] }> = [
  {
    loc: base,
    images: [
      ["/photos/brand-logo.jpg", "Prime Labels International brand logo"],
      ["/photos/DaNaYhvEwXS_0.jpg", "Custom woven clothing labels"],
      ["/photos/ai-brand-packaging.jpg", "Premium brand packaging for clothing brands"],
    ],
  },
  {
    loc: `${base}/gcc-custom-labels`,
    images: [
      ["/photos/DaNaYhvEwXS_0.jpg", "Woven labels for Saudi Arabia and GCC brands"],
      ["/photos/ai-hang-tags.jpg", "Custom hang tags for apparel brands"],
      ["/photos/ai-zipper-bags.jpg", "Custom zipper bags and packaging"],
    ],
  },
  {
    loc: `${base}/gallery`,
    images: [
      ["/photos/DaNaoG7kxUT_0.jpg", "Garment branding portfolio image"],
      ["/photos/DaNaYhvEwXS_1.jpg", "Premium woven label detail"],
      ["/photos/DYQ2pCbjHoE_0.jpg", "Custom packaging and label example"],
    ],
  },
];

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const urls = entries
    .map((entry) => {
      const images = entry.images
        .map(
          ([path, title]) => `    <image:image>
      <image:loc>${esc(`${base}${path}`)}</image:loc>
      <image:title>${esc(title)}</image:title>
    </image:image>`
        )
        .join("\n");

      return `  <url>
    <loc>${esc(entry.loc)}</loc>
${images}
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
