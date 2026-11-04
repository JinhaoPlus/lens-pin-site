import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import worker, { preferredLanguage } from '../worker.mjs';

for (const [header, expected] of [
  ['', 'en'], ['zh-CN,zh;q=0.9,en;q=0.8', 'zh'], ['en-US,en;q=0.9,zh;q=0.8', 'en'],
  ['en;q=0.5,zh;q=0.9', 'zh'], ['zh;q=0,en;q=1', 'en'], ['fr,zh;q=0.8,en;q=0.6', 'zh'],
  ['zh;q=broken,en', 'en'], ['zh;q=0', 'en'], ['*', 'en'], ['en,zh', 'en'],
]) assert.equal(preferredLanguage(header), expected, header);
let delegated = false;
const response = await worker.fetch(new Request('https://example.test/en/'), { ASSETS: { fetch() { delegated = true; return new Response('asset'); } } });
assert.ok(delegated); assert.equal(await response.text(), 'asset');
const base = process.env.REDIRECT_TEST_ORIGIN || 'http://127.0.0.1:4196';
const results = [];
// Unlike fetch(), raw HTTP does not insert Accept-Language: * when omitted.
const read = (url, headers) => new Promise((resolve, reject) => {
  const request = (url.startsWith('https:') ? httpsRequest : httpRequest)(url, { headers }, response => {
    response.resume();
    resolve({ status: response.statusCode, headers: new Headers(response.headers) });
  });
  request.on('error', reject); request.end();
});
for (const header of ['', 'zh-CN,zh;q=0.9,en;q=0.8', 'en-US,en;q=0.9,zh;q=0.8']) {
  for (const path of ['/', '/en', '/zh']) {
    const res = await read(base + path, header ? { 'Accept-Language': header } : {});
    const location = new URL(res.headers.get('location'), base);
    const target = path === '/' ? `/${preferredLanguage(header)}/` : path + '/';
    assert.equal(res.status, path === '/' ? 302 : 301);
    assert.equal(location.pathname, target);
    if (path === '/') { assert.equal(res.headers.get('vary'), 'Accept-Language'); assert.match(res.headers.get('cache-control'), /no-store/); }
    const final = await fetch(location); assert.equal(final.status, 200);
    results.push({ path, acceptLanguage: header || '(absent)', status: res.status, target, vary: res.headers.get('vary'), finalStatus: final.status });
  }
}
const query = await fetch(base + '/?ref=language-test', { headers: { 'Accept-Language': 'zh' }, redirect: 'manual' });
assert.equal(new URL(query.headers.get('location')).search, '?ref=language-test');
console.log(JSON.stringify(results, null, 2));
console.log('Passed quality ordering, q=0, invalid q, fallback, ties, query retention and static delegation.');

const entries = readFileSync(new URL('../dist/_redirects', import.meta.url),'utf8').split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#')).map(line => line.split(/\s+/)).filter(parts => parts[2] === '301');
for (const [source,target] of entries) {
  const response = await read(base + source, {});
  assert.equal(response.status,301,source);
  const location = new URL(response.headers.get('location'),base);
  assert.equal(location.href,new URL(target,base).href,source + ': direct target');
  const final = await read(location.href, {});
  assert.equal(final.status,200,source + ': target must return 200 without another redirect');
}
console.log(`Verified all ${entries.length} permanent redirects and their direct 200 targets.`);

// Exercise real Static Assets responses; Worker delegation alone cannot prove headers.
for (const [path, mime] of [
  ['/en/', 'text/html'], ['/zh/', 'text/html'], ['/assets/styles.css', 'text/css'],
  ['/assets/site.js', 'text/javascript'], ['/sitemap.xml', 'application/xml'],
  ['/robots.txt', 'text/plain'], ['/assets/download-on-the-app-store.svg', 'image/svg+xml'],
]) {
  const response = await read(base + path, {});
  assert.equal(response.status, 200, path);
  const type = response.headers.get('content-type') || '';
  assert.equal(type.split(';')[0].trim().toLowerCase(), mime, path);
  assert.match(type, /;\s*charset=utf-8(?:;|$)/i, `${path}: UTF-8 charset`);
}
console.log('Verified UTF-8 Content-Type for HTML, CSS, JavaScript, XML, text and SVG static responses.');
