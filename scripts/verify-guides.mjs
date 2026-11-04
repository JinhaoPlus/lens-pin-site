import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const routes = [
  '/en/add-location-to-camera-photos-apple-photos/',
  '/en/add-location-to-photos-mac/',
  '/en/geotag-photos-gpx-mac/',
  '/en/camera-photos-no-location/',
  '/en/camera-photos-not-on-apple-photos-map/',
  '/zh/add-location-to-photos-iphone/',
  '/zh/import-camera-photos-to-iphone/',
  '/zh/camera-photos-not-on-apple-photos-map/',
  '/zh/photo-location-wrong-or-missing/',
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
  assert.ok(length >= (zh ? 1500 : 600) && length <= (zh ? 2500 : 1000), `${route}: length ${length}`);
  assert.doesNotMatch(text, /limited.time free|限时免费|Unlimited is free/i);
  for (const fact of [zh ? /100 次成功/ : /100 successful/, /US \$3\.99/, /¥12/, /GPX/]) assert.match(text, fact);
  assert.doesNotMatch(body.match(/<ol>([\s\S]*?)<\/ol>/)?.[1] || '', /LensPin/, `${route}: built-in checks before batch option`);
  const graph = [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => JSON.parse(m[1])['@graph']);
  const articles = graph.filter((n) => n['@type'] === 'Article');
  assert.equal(articles.length, 1);
  assert.equal(articles[0].headline, source.match(/<h1>(.*?)<\/h1>/s)[1]);
  assert.equal(articles[0].dateModified, '2026-11-04');
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
  for (const route of routes.filter((r) => r.startsWith(`/${language}/`))) assert.ok(directory.includes(`href="${route}"`));
}
const standalone = read('/zh/photo-location-wrong-or-missing/');
assert.doesNotMatch(standalone, /hreflang="(?:en|x-default)"/);
assert.doesNotMatch(standalone, /href="https:\/\/getlenspin.com\/en\/camera-photos-not-on-apple-photos-map\//);
assert.match(read('/zh/camera-photos-not-on-apple-photos-map/'), /信息正确，但地图看起来不完整/);
assert.match(standalone, /新拍的 iPhone 照片没有位置：检查定位权限/);
for (const route of routes) {
  assert.doesNotMatch(read(route), /Adjust Info|调整信息|(?<!LensPin )\bUnlimited\b/);
}
console.log(`Verified ${routes.length} guides: body lengths, product/pricing boundaries, Article data, discoverability, fragments and actual language counterparts.`);
