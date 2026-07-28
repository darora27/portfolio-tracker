import { chromium } from "playwright";
const base = process.env.PHASE10_BASE_URL;
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
for (const width of [390, 320]) {
  const page = await browser.newPage({ viewport: { width, height: 844 } });
  await page.addInitScript(()=>{window.localStorage.setItem("stock-market-universe-orientation-seen","true");});
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const audit = await page.evaluate(() => {
    const targets=[...document.querySelectorAll("a,button")].filter(t=>t.tabIndex>=0)
      .map(t=>({r:t.getBoundingClientRect(),l:(t.getAttribute('aria-label')||t.textContent||'').trim().slice(0,40)}))
      .filter(o=>o.r.width>1&&o.r.height>1);
    const small=targets.filter(o=>o.r.width<44||o.r.height<44).map(o=>({label:o.l,w:+o.r.width.toFixed(1),h:+o.r.height.toFixed(1)}));
    return {
      canvasCount: document.querySelectorAll("canvas").length,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      noOverflow: document.documentElement.scrollWidth === document.documentElement.clientWidth,
      targetCount: targets.length,
      undersizedCount: small.length,
      undersized: small.slice(0,8),
    };
  });
  console.log(JSON.stringify({viewport:`${width}x844`, ...audit}, null, 1));
  await page.close();
}
await browser.close();
