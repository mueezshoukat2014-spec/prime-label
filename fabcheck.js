const puppeteer = require("puppeteer");
(async () => {
  const b = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] });
  for (const path of ["/", "/quote", "/gallery"]) {
    const p = await b.newPage();
    await p.setViewport({ width: 390, height: 844 });
    await p.goto("https://primelabelsintl.com" + path, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 2500));
    const info = await p.evaluate(() => {
      const a = document.querySelector('a[aria-label="Chat with us on WhatsApp"]');
      if (!a) return { found: false };
      const r = a.getBoundingClientRect();
      const cs = getComputedStyle(a);
      return {
        found: true,
        href: a.getAttribute("href"),
        pos: cs.position,
        bottom: Math.round(r.bottom),
        right: Math.round(window.innerWidth - r.right),
        z: cs.zIndex,
      };
    });
    console.log(path.padEnd(10), JSON.stringify(info));
    await p.close();
  }
  await b.close();
})();
