import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const dist = new URL('../dist/', import.meta.url).pathname;
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const read = route => readFileSync(join(dist, route, 'index.html'), 'utf8');
const plain = source => source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const pages = walk(dist).filter(p => p.endsWith('.html'));
for (const file of walk(dist).filter(p => /\.(html|css|js|xml|txt|json|svg|md|webmanifest)$/.test(p))) {
  const s = readFileSync(file, 'utf8');
  assert.doesNotMatch(s, /visionOS|Apple\s+Vision|Vision\s+Pro/i, file);
  assert.doesNotMatch(s, /原生|\bnative\b/i, file);
  assert.doesNotMatch(s, /(?:iOS|iPadOS|macOS)\s*(?:[\/／]\s*iPadOS\s*)?\d+(?:[.\d–—+-]*)/i, file);
  if (!file.endsWith('.svg')) assert.doesNotMatch(s, /\$3\.99|¥12|3\.99|limited-time|限时免费|anchor|launch plan|1\.3\.2|HoudahGeo|GeoTag/);
}
for (const file of pages) {
  if (file.endsWith('/404.html')) continue;
  const s = readFileSync(file, 'utf8'), zh = file.includes('/zh/');
  const nav = s.match(/<nav class="desktop-nav"[^>]*>([\s\S]*?)<\/nav>/)[1];
  const labels = [...nav.matchAll(/<a[^>]*>(.*?)<\/a>/g)].map(m => m[1]);
  assert.deepEqual(labels, zh ? ['工作原理', '价格', '教程', '帮助'] : ['How it works', 'Pricing', 'Guides', 'Support']);
  assert.doesNotMatch(plain(s), /High confidence|No Suggestion|待检查|无建议|one-pin editor|source agreement|location additions/);
}
for (const lang of ['en','zh']) {
  const s = read(lang), main = s.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.equal((main.match(/<section\b/g) || []).length, 8);
  for (const key of ['photos','camera','gpx','workout']) assert.ok(main.includes(`data-evidence-tab="${key}"`));
  assert.match(main, /id="pricing"/);
  assert.match(main, /HealthKit/);
  assert.doesNotMatch(main, /visionOS|Apple Vision|Vision Pro/i);
  assert.match(main, /100/);
  assert.match(main, /LensPin Unlimited/);
  assert.match(main, lang === 'en' ? /one photo or video counts as one use/ : /每成功为一张照片或一个视频保存位置计一次/);
  if (lang === 'en') assert.doesNotMatch(plain(main), /\bevidence\b/i);
  for (const route of ['support','privacy']) assert.match(read(`${lang}/${route}`), /href="https:\/\/www\.reddit\.com\/r\/LensPin\/"/);
  const how = plain(read(`${lang}/how-it-works`));
  for (const label of lang === 'en' ? ['High Confidence','Review','No Clear Suggestion'] : ['高可信','需检查','无明确建议']) assert.ok(how.includes(label));
}
console.log(`Verified copy across ${pages.length} HTML files: pricing, navigation, source choices, categories, contact paths and forbidden legacy wording.`);

const macBadgeRoutes = ['en', 'zh', 'en/add-location-to-photos-mac', 'en/geotag-photos-gpx-mac'];
for (const file of pages) {
  const route = file.slice(dist.length).replace(/\/index\.html$/, '');
  if (!macBadgeRoutes.includes(route)) assert.doesNotMatch(readFileSync(file, 'utf8'), /data-mac-app-store-badge/, file);
}
for (const route of macBadgeRoutes) {
  const source = read(route), home = !route.includes('/'), zh = route === 'zh';
  const badges = [...source.matchAll(/<a\b[^>]*data-mac-app-store-badge[^>]*>[\s\S]*?<\/a>/g)];
  assert.equal(badges.length, 1, route);
  for (const [badge] of badges) {
    assert.match(badge, /href="https:\/\/apps.apple.com\/app\/id6812626038\?pt=129459678&ct=website_mac&mt=12"/);
    assert.ok(badge.includes(`/assets/download-on-the-mac-app-store${zh ? '-zh' : ''}.svg`));
    assert.ok(badge.includes(zh ? '在 Mac App Store 下载' : 'Download on the Mac App Store'));
    assert.doesNotMatch(badge, /data-app-store-link/);
  }
  if (home) for (const section of ['<div class="hero-actions">', 'id="pricing"']) {
    const region = source.slice(source.indexOf(section)).split('</section>')[0];
    assert.match(region, /data-app-store-badge/);
    assert.equal((region.match(/data-app-store-badge/g) || []).length, 1, route);
    assert.doesNotMatch(region, /data-mac-app-store-badge|download-badges/);
  }
  if (home) {
    const macSection = source.match(/<section\b[^>]*id="mac-app"[^>]*>[\s\S]*?<\/section>/)?.[0];
    assert.ok(macSection, route);
    assert.match(macSection, /data-mac-app-store-badge/);
    assert.doesNotMatch(macSection, /data-app-store-badge/);
  } else {
    const downloadSection = source.match(/<section\b[^>]*><div class="prose"><h2>Get LensPin<\/h2>[\s\S]*?<\/section>/)?.[0];
    assert.ok(downloadSection, route);
    assert.match(downloadSection, /data-mac-app-store-badge/);
  }
  assert.doesNotMatch(source, /<div class="download-badges">\s*<\/div>/);
}
console.log('Verified localized Mac badges only in home Mac introductions and Mac guide download sections; home hero/pricing retain single App Store badges.');
