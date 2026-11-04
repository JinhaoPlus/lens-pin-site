import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
const dist = new URL('../dist/', import.meta.url).pathname;
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((item) => item.isDirectory() ? walk(join(dir, item.name)) : [join(dir, item.name)]);
const decode = (s) => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&nbsp;', ' ');
const text = (s) => decode(s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
const pages = walk(dist).filter((file) => file.endsWith('.html'));
let faqCount = 0, appCount = 0;
const campaigns = new Set();
for (const file of pages) {
  const label = relative(dist, file), source = readFileSync(file, 'utf8');
  const route = '/' + label.replace(/index\.html$/, '');
  const notFound = label === '404.html';
  const [locale, ...parts] = route.split('/').filter(Boolean);
  const aliases = {
    'support_gpx-requirements': 'support_gpx', 'support_location-writeback': 'support_writeback',
    'import-camera-photos-to-iphone': 'import_camera_photos', 'add-location-to-photos-iphone': 'add_photo_location',
    'gpx-photo-geotagging-iphone': 'gpx_geotagging', 'geotag-dslr-photos-with-iphone-photos': 'geotag_with_photos',
    'export-gpx-from-garmin-coros-suunto': 'export_watch_gpx', 'record-gpx-on-iphone-apple-watch': 'record_gpx',
    'add-location-to-camera-photos-apple-photos': 'camera_photo_location',
    'add-location-to-photos-mac': 'photo_location_mac', 'geotag-photos-gpx-mac': 'gpx_mac',
    'camera-photos-no-location': 'camera_no_location', 'camera-photos-not-on-apple-photos-map': 'photos_map_fix',
    'photo-location-wrong-or-missing': 'photo_location_fix',
  };
  const topic = parts.join('_') || 'home';
  const expectedCampaign = `web_${aliases[topic] || topic}_${locale}`;
  const meta = new Map([...source.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)">/g)].map((m) => [m[1], decode(m[2])]));
  for (const key of ['og:title','og:description','og:image','og:image:width','og:image:height','og:image:alt','twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt']) assert.ok(meta.get(key), `${label}: ${key}`);
  assert.equal(meta.get('og:image:width'), '1200');
  assert.equal(meta.get('og:image:height'), '630');
  assert.equal(meta.get('twitter:card'), 'summary_large_image');
  assert.equal(meta.get('og:title'), text(source.match(/<title>(.*?)<\/title>/s)[1]));
  assert.equal(meta.get('og:description'), meta.get('description'));
  for (const image of source.matchAll(/<img\b[^>]*>/g)) assert.match(image[0], / alt="[^"]*"/, `${label}: alt`);
  assert.ok([...meta.get('description')].length <= (locale === 'zh' ? 80 : 160), `${label}: description too long`);
  const title = text(source.match(/<title>(.*?)<\/title>/s)[1]);
  const h1s = [...source.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(m => text(m[1]));
  assert.equal(h1s.length, 1, `${label}: exactly one h1`);
  assert.ok(h1s[0], `${label}: nonempty h1`);
  assert.doesNotMatch(h1s[0], /[.。]$/, `${label}: h1 terminal punctuation`);
  assert.equal((title.match(/ \| /g) || []).length, 1, `${label}: one title separator`);
  assert.doesNotMatch(title, /[｜·]/, `${label}: title separator`);
  const matchingTitle = locale === 'zh' ? 'LensPin 如何按拍摄时间匹配相机照片位置 | LensPin' : 'How LensPin matches camera photos by time | LensPin';
  const isMatchingPage = parts.join('/') === 'how-it-works';
  if (isMatchingPage) assert.equal(title, matchingTitle, `${label}: required matching title`);
  else assert.equal((title.match(/LensPin/g) || []).length, 1, `${label}: brand once`);
  assert.ok(parts.length === 0 && !notFound ? title.startsWith('LensPin | ') : title.endsWith(' | LensPin'), `${label}: title brand placement`);
  assert.ok([...title].length <= (locale === 'zh' ? (isMatchingPage ? [...matchingTitle].length : 30) : 60), `${label}: title length`);
  if (locale === 'en' && parts.join('/') === 'privacy') assert.ok([...meta.get('description')].length >= 110, `${label}: privacy description too short`);
  if (locale === 'zh' && parts.join('/') === 'guides') assert.ok([...meta.get('description')].length >= 50, `${label}: guide description too short`);
  const graph = [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => { const json = JSON.parse(m[1]); return json['@graph'] || [json]; });
  for (const node of graph) {
    assert.equal(node.aggregateRating, undefined);
    if (['SoftwareApplication', 'MobileApplication'].includes(node['@type'])) {
      appCount++;
      for (const fact of [/iPhone/, /GPS/, /GPX/, /Apple Health|Apple 健康|“健康”App/, /without export|无需导出/]) assert.match(node.description, fact);
      assert.ok(Array.isArray(node.featureList) && node.featureList.length >= 4);
      assert.doesNotMatch(node.featureList.join(' '), /writeback|interpolation|evidence fusion/i);
      assert.equal(node.screenshot.length, 2);
      for (const url of node.screenshot) assert.ok(walk(dist).includes(join(dist, new URL(url).pathname)));

      assert.deepEqual(node.operatingSystem, ['iOS', 'iPadOS', 'macOS']);
      assert.equal(node.offers.price, 0);
      assert.match(node.offers.description, locale === 'zh' ? /100 次成功补定位.*一次性.*不是订阅/s : /100 successful location additions.*one-time.*Not a subscription/s);
      assert.equal(new URL(node.downloadUrl).searchParams.get('ct'), expectedCampaign);
    }
  }
  const visible = [...source.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>\s*<div class="faq-answer">([\s\S]*?)<\/div>\s*<\/details>/g)].map(([, q,a]) => [text(q),text(a)]);
  const faq = graph.filter((node) => node['@type'] === 'FAQPage');
  assert.equal(faq.length, visible.length ? 1 : 0, `${label}: FAQ schema count`);
  if (visible.length) { faqCount += visible.length; assert.deepEqual(faq[0].mainEntity.map((q) => [q.name,q.acceptedAnswer.text]), visible, `${label}: FAQ parity`); }
  if (notFound) continue;
  assert.ok(expectedCampaign.length <= 30);
  assert.match(source, /iPhone/);
  assert.match(source, /iPad/);
  assert.match(source, /Mac/);
  const links = [...source.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*data-app-store-link[^>]*>/g)];
  assert.ok(links.length);
  for (const [, href] of links) assert.equal(decode(href), `https://apps.apple.com/app/id6812626038?pt=129459678&ct=${expectedCampaign}&mt=8`, `${label}: campaign`);
  assert.ok(meta.get('apple-itunes-app').includes(`ct=${expectedCampaign}&mt=8`));
  assert.ok(!campaigns.has(expectedCampaign)); campaigns.add(expectedCampaign);
  if (parts.length === 0) {
    for (const type of ['Organization','WebSite']) {
      const entities = graph.filter((n) => n['@type'] === type); assert.equal(entities.length,1);
      assert.equal(entities[0].name,'LensPin'); assert.equal(entities[0].url,'https://getlenspin.com/');
      assert.deepEqual(entities[0].alternateName,['LensPin: Photo Geotagger','LensPin：相机照片补定位']);
      assert.deepEqual(entities[0].sameAs,['https://apps.apple.com/us/app/lenspin-photo-geotagger/id6812626038','https://www.reddit.com/r/LensPin/']);
    }
    for (const type of ['SoftwareApplication', 'WebPage', 'BreadcrumbList']) assert.equal(graph.filter((n) => n['@type'] === type).length, 1);
    assert.match(text(source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]), /^LensPin.*Mac/);
  }
}
const sitemap = readFileSync(join(dist,'sitemap.xml'),'utf8');
assert.match(sitemap, /xmlns:xhtml="http:\/\/www.w3.org\/1999\/xhtml"/);
const urls = [...sitemap.matchAll(/<url><loc>(.*?)<\/loc>(.*?)<\/url>/g)];
assert.equal(urls.length,pages.length - 1);
for (const [,url,alternates] of urls) {
  const path = new URL(url).pathname;
  const route = path.replace(/^\/(en|zh)/,'');
  const expected = [['en','en'],['zh-Hans','zh'],['x-default','en']].filter(([,locale]) => pages.includes(join(dist,locale,route,'index.html')));
  assert.equal([...alternates.matchAll(/<xhtml:link /g)].length, expected.length, `${path}: alternate count`);
  for (const [lang,locale] of expected) assert.ok(alternates.includes(`hreflang="${lang}" href="https://getlenspin.com/${locale}${route}"`));
}
assert.equal(readFileSync(join(dist,'robots.txt'),'utf8'), 'User-agent: *\nAllow: /\n\nSitemap: https://getlenspin.com/sitemap.xml\n');
const csp = readFileSync(join(dist,'_headers'),'utf8').match(/Content-Security-Policy: (.*)/)[1];
assert.equal(csp, "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: https://tools.applemediaservices.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; font-src 'self'; form-action 'none'");
for (const locale of ['en','zh']) assert.ok(readFileSync(join(dist, `assets/lenspin-social-${locale}.jpg`)).length < 300000);
assert.ok(readFileSync(join(dist, 'assets/lenspin-app-icon.png')).length < 12000);
for (const [,url,entry] of urls) {
  const source = readFileSync(join(dist,new URL(url).pathname,'index.html'),'utf8');
  const date = source.match(/<meta name="last-modified" content="([^"]+)"/)?.[1];
  assert.match(entry, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  assert.match(date || '', /^\d{4}-\d{2}-\d{2}$/, url + ': required last-modified');
  {
    assert.ok(entry.includes(`<lastmod>${date}</lastmod>`), url);
    const updates = [...source.matchAll(/(?:Last updated|更新于)\s*<time datetime="([^"]+)">([^<]+)<\/time>/g)];
    assert.equal(updates.length, 1, url + ': one visible update date');
    assert.equal(updates[0][1], date, url + ': visible update datetime');
    const [year, month, day] = date.split('-').map(Number);
    const displayDate = url.includes('/zh/') ? `${year} 年 ${month} 月 ${day} 日` : new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric', timeZone:'UTC'});
    assert.equal(updates[0][2], displayDate, url + ': visible update text');
    assert.match(source, new RegExp(`(?:Last updated|更新于)\\s*<time datetime="${date}">`), url + ': labeled visible date');
    let datedNodes = 0;
    for (const [,raw] of source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      for (const node of JSON.parse(raw)['@graph'] || []) if (['Article','WebPage','CollectionPage'].includes(node['@type'])) { datedNodes++; assert.equal(node.dateModified,date,url); }
    }
    assert.ok(datedNodes > 0, url + ': dated page schema');
  }
}
console.log(`Verified ${pages.length} HTML files, ${campaigns.size} unique campaigns, ${faqCount} FAQ answers, ${appCount} application entities, ${urls.length} sitemap alternate sets, social image and CSP.`);

// Counterparts must expose the same schema types, including visible FAQ coverage.
const schemaTypes = file => [...readFileSync(file, 'utf8').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .flatMap(m => JSON.parse(m[1])['@graph'] || [JSON.parse(m[1])]).map(n => n['@type']).sort();
for (const file of pages.filter(p => p.includes('/en/'))) {
  const counterpart = file.replace('/en/', '/zh/');
  assert.ok(pages.includes(counterpart), `${file}: missing Chinese counterpart`);
  assert.deepEqual(schemaTypes(counterpart), schemaTypes(file), `${file}: localized schema type parity`);
}
