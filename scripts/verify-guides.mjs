import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const routes = [
  '/en/add-location-to-camera-photos-apple-photos/',
  '/en/add-location-to-photos-mac/',
  '/en/geotag-photos-gpx-mac/',
  '/zh/add-location-to-camera-photos-apple-photos/',
  '/zh/add-location-to-photos-mac/',
  '/zh/geotag-photos-gpx-mac/',
  '/en/camera-photos-no-location/',
  '/zh/add-location-to-photos-iphone/',
  '/zh/import-camera-photos-to-iphone/',
  '/zh/camera-photos-no-location/',
];
const read = (route) => readFileSync(join(dist, route, 'index.html'), 'utf8');
const plain = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
for (const route of routes) {
  const source = read(route), zh = route.startsWith('/zh/');
  const body = source.match(/data-guide-body>([\s\S]*?)<\/div><\/article>/)?.[1];
  assert.ok(body, `${route}: guide body`);
  const text = plain(body);
  const length = zh ? [...text.matchAll(/[\u3400-\u9fff]/g)].length : text.split(/\s+/).length;
  // Focused guides link to the full workflow instead of repeating it to reach a word count.
  assert.ok(length >= (zh ? (route === '/zh/add-location-to-photos-iphone/' ? 1400 : 1500) : 400) && length <= (zh ? 2500 : 1000), `${route}: length ${length}`);
  assert.doesNotMatch(text, /limited.time free|限时免费|Unlimited is free/i);
  const pricing = zh ? '免费下载 · 前 100 次补定位免费 · 一次性买断' : 'Free to try · first 100 locations free · one-time unlock';
  // A troubleshooting article need not pitch a download; existing pricing is one short line.
  if (route !== '/en/camera-photos-no-location/') assert.ok(source.includes(pricing), `${route}: concise pricing`);
  assert.ok(source.split(pricing).length <= 2, `${route}: pricing once`);
  assert.doesNotMatch(text, /LensPin Unlimited|App Store for the price|以 App Store 页面价格为准/, `${route}: no full pricing paragraph`);
  if (!route.endsWith('/camera-photos-not-on-apple-photos-map/')) assert.match(text, /GPX/);
  assert.doesNotMatch(body.match(/<ol>([\s\S]*?)<\/ol>/)?.[1] || '', /LensPin/, `${route}: built-in checks before batch option`);
  const graph = [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => JSON.parse(m[1])['@graph']);
  const articles = graph.filter((n) => n['@type'] === 'Article');
  assert.equal(articles.length, 1);
  assert.equal(articles[0].headline, source.match(/<h1>(.*?)<\/h1>/s)[1]);
  assert.equal(articles[0].dateModified, '2026-11-05');
  assert.equal(articles[0].mainEntityOfPage, 'https://getlenspin.com' + route);
  const language = zh ? 'zh' : 'en';
  for (const parent of [`/${language}/`, `/${language}/guides/`]) assert.ok(read(parent).includes(`href="${route}"`), `${parent}: guide discoverability`);
  assert.ok(sitemap.includes(`<loc>https://getlenspin.com${route}</loc>`));
  const localTargets = [...source.matchAll(/href="(\/[^"?#]*)(?:\?[^"#]*)?(?:#([^"]+))?"/g)];
  for (const [,path,fragment] of localTargets) {
    const file = join(dist, path, path.endsWith('/') ? 'index.html' : '');
    assert.ok(existsSync(file), `${route}: ${path}`);
    if (fragment) assert.ok(readFileSync(file,'utf8').includes(`id="${fragment}"`), `${route}: ${path}#${fragment}`);
  }
  for (const [,id] of source.matchAll(/href="#([^"]+)"/g)) assert.ok(source.includes(`id="${id}"`), `${route}: #${id}`);
  const alternates = [...source.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
  for (const [,language,url] of alternates) {
    const target = new URL(url).pathname;
    assert.ok(existsSync(join(dist,target,'index.html')), `${route}: untranslated alternate ${target}`);
    if (language !== 'x-default') assert.ok(read(target).includes(`href="https://getlenspin.com${route}"`), `${target}: reciprocal alternate`);
  }
  console.log(`${route}: ${length} ${zh ? 'Chinese characters' : 'words'}`);
}
for (const language of ['en','zh']) {
  const directory = read(`/${language}/guides/`);
  assert.match(directory, /"@type":"CollectionPage"/);
  const intro = language === 'zh' ? '按设备、位置来源和问题选择教程。' : 'Choose a guide by device, location source or troubleshooting need.';
  const pricing = language === 'zh'
    ? '免费下载，前 100 次成功补定位免费（照片和视频共享额度），之后可选择一次性买断（非订阅），以 App Store 页面价格为准。'
    : 'Free download. The first 100 successful location additions are free (shared by photos and videos), then an optional one-time purchase (not a subscription); price as shown on the App Store.';
  assert.ok(directory.includes(`<p class="page-lede">${intro}</p><p class="guides-pricing">${pricing}</p>`), `${language}: directory intro and pricing`);
  assert.equal(directory.split(pricing).length - 1, 1, `${language}: directory pricing once`);
  for (const route of routes.filter((r) => r.startsWith(`/${language}/`))) assert.ok(directory.includes(`href="${route}"`));
}
for (const lang of ['en','zh']) {
  const merged = read(`/${lang}/camera-photos-no-location/`);
  for (const id of ['original-no-gps','located-not-on-map','wrong-location','permissions-icloud']) assert.ok(merged.includes(`id="${id}"`));
  assert.ok(merged.includes(`hreflang="${lang === 'en' ? 'zh-Hans' : 'en'}"`));
}
assert.doesNotMatch(plain(read('/zh/camera-photos-no-location/').match(/<main[^>]*>([\s\S]*?)<\/main>/)[1]), /Apple Photos/);
for (const route of routes) {
  assert.doesNotMatch(read(route), /Adjust Info|调整信息|(?<!LensPin )\bUnlimited\b/);
}
console.log(`Verified ${routes.length} guides: body lengths, current product/pricing boundaries, Article data, discoverability, fragments and actual language counterparts.`);

for (const lang of ['en','zh']) {
  const directory = read(`/${lang}/guides/`);
  const excluded = new Set(['guides','privacy','support','user-feedback']);
  for (const entry of readdirSync(join(dist,lang),{withFileTypes:true})) {
    if (!entry.isDirectory() || excluded.has(entry.name)) continue;
    assert.ok(directory.includes(`href="/${lang}/${entry.name}/"`), `${lang}: missing directory guide ${entry.name}`);
  }
  const gpx = read(`/${lang}/how-to-get-gpx-file/`);
  for (const id of ['garmin','coros','suunto','iphone-apps','strava','apple-watch']) assert.ok(gpx.includes(`id="${id}"`));
  assert.ok(gpx.includes(`href="/${lang}/how-it-works/#health-workout-routes"`));
  const how = read(`/${lang}/how-it-works/`), main = how.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.ok(main.includes('id="health-workout-routes"'));
  assert.equal((main.match(/data-app-store-badge/g) || []).length,1);
  assert.match(main, /id="download"[\s\S]*data-app-store-badge[\s\S]*<\/section>\s*$/);
  assert.doesNotMatch(main, /data-mac-app-store-badge/);
}
