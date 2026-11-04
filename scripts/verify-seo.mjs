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
      assert.match(node.offers.description, /100 photos\/videos.*one-time.*Not a subscription/s);
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
  if (date) {
    assert.ok(entry.includes(`<lastmod>${date}</lastmod>`), url);
    assert.ok(source.includes(`<time datetime="${date}">`), url + ': visible update date');
    for (const [,raw] of source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      for (const node of JSON.parse(raw)['@graph'] || []) if (['Article','WebPage','CollectionPage'].includes(node['@type'])) assert.equal(node.dateModified,date,url);
    }
  }
}
console.log(`Verified ${pages.length} HTML files, ${campaigns.size} unique campaigns, ${faqCount} FAQ answers, ${appCount} application entities, ${urls.length} sitemap alternate sets, social image and CSP.`);
