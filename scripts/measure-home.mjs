// Start the local preview first; PLAYWRIGHT_MODULE can point to an installed ESM entry.
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.HOME_TEST_ORIGIN || 'http://127.0.0.1:4196';
const browser = await chromium.launch({ channel: 'chrome' });
const rows = [];
try {
  for (const width of [390, 768, 1440]) {
    for (const lang of ['en', 'zh']) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      try {
        await page.goto(`${origin}/${lang}/`);
        await page.evaluate(() => document.fonts.ready);
        const row = await page.evaluate(() => {
          const header = document.querySelector('.site-header');
          const eyebrow = document.querySelector('.hero .eyebrow');
          const rect = eyebrow.getBoundingClientRect();
          const name = document.querySelector('.store-search');
          const range = document.createRange();
          range.selectNodeContents(eyebrow);
          const lines = [...range.getClientRects()];
          return {
            scrollY, headerBottom: header.getBoundingClientRect().bottom,
            eyebrowTop: rect.top, eyebrowBottom: rect.bottom,
            text: eyebrow.textContent, transform: getComputedStyle(eyebrow).textTransform,
            allLinesVisible: lines.every(r => r.top >= header.getBoundingClientRect().bottom && r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight && eyebrow.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2))),
            storeText: name.textContent, storeVisible: name.checkVisibility(),
            storeInPricing: !!name.closest('#pricing'),
            visibleNameCount: document.body.innerText.split(name.textContent.includes('Photo Geotagger') ? 'LensPin: Photo Geotagger' : 'LensPin：相机照片补定位').length - 1,
          };
        });
        assert.equal(row.scrollY, 0);
        assert.ok(row.eyebrowTop >= row.headerBottom + 24);
        assert.ok(row.allLinesVisible);
        assert.equal(row.transform, 'none');
        assert.equal(row.text, lang === 'en' ? 'Sony, Fujifilm, Canon, GoPro, Insta360 and more' : '索尼、富士、佳能、GoPro、Insta360 等相机照片没有位置？');
        assert.ok(row.storeVisible && row.storeInPricing);
        assert.equal(row.visibleNameCount, 1);
        rows.push({ route: `/${lang}/`, width, ...row });
      } finally { await page.close(); }
    }
  }
  console.log(JSON.stringify(rows, null, 2));
  console.log('Passed home first-load header clearance, text visibility, brand casing and visible store names.');
} finally { await browser.close(); }
