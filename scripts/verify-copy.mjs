import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const dist = new URL('../dist/', import.meta.url).pathname;
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const read = route => readFileSync(join(dist, route, 'index.html'), 'utf8');
const plain = source => source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const pages = walk(dist).filter(p => p.endsWith('.html'));
for (const file of walk(dist).filter(p => /\.(html|css|js|xml|txt)$/.test(p))) {
  const s = readFileSync(file, 'utf8');
  assert.doesNotMatch(s, /\$3\.99|¥12|3\.99|limited-time|限时免费|anchor|launch plan|1\.3\.2|HoudahGeo|GeoTag/);
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
  assert.match(main, /Apple Vision/);
  assert.match(main, /100/);
  assert.match(main, /LensPin Unlimited/);
  assert.match(main, lang === 'en' ? /one photo or video counts as one use/ : /每成功为一张照片或一个视频保存位置计一次/);
  if (lang === 'en') assert.doesNotMatch(plain(main), /\bevidence\b/i);
  for (const route of ['support','privacy']) assert.match(read(`${lang}/${route}`), /href="https:\/\/www\.reddit\.com\/r\/LensPin\/"/);
  const how = plain(read(`${lang}/how-it-works`));
  for (const label of lang === 'en' ? ['High Confidence','Review','No Clear Suggestion'] : ['高可信','需检查','无明确建议']) assert.ok(how.includes(label));
}
console.log(`Verified copy across ${pages.length} HTML files: pricing, navigation, source choices, categories, contact paths and forbidden legacy wording.`);
