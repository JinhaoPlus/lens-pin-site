import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const dist = new URL('../dist/', import.meta.url).pathname;
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const read = route => readFileSync(join(dist, route, 'index.html'), 'utf8');
const plain = source => source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const contactText = source => plain(source.replace(/<\/?a\b[^>]*>/g, '')).trim();
const pages = walk(dist).filter(p => p.endsWith('.html'));
for (const file of walk(dist).filter(p => /\.(html|css|js|xml|txt|json|svg|md|webmanifest)$/.test(p))) {
  const s = readFileSync(file, 'utf8');
  assert.doesNotMatch(s, /mailto:|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, `${file}: no email addresses`);
  assert.doesNotMatch(s, /visionOS|Apple\s+Vision|Vision\s+Pro/i, file);
  assert.doesNotMatch(s, /原生|\bnative\b/i, file);
  assert.doesNotMatch(s, /(?:iOS|iPadOS|macOS)\s*(?:[\/／]\s*iPadOS\s*)?\d+(?:[.\d–—+-]*)/i, file);
  if (!file.endsWith('.svg')) assert.doesNotMatch(s, /\$3\.99|¥12|3\.99|limited-time|限时免费|anchor|launch plan|1\.3\.2|HoudahGeo|GeoTag/);
}
for (const file of pages) {
  if (file.endsWith('/404.html')) continue;
  const s = readFileSync(file, 'utf8'), zh = file.includes('/zh/');
  assert.doesNotMatch(s, /前\s*100\s*张|first 100 photos|no promise|does not guarantee|makes no|不保证|不承诺/i, file);
  const callouts = /<p class="page-lede">(?:LensPin reads Apple Watch workout routes|Apple Watch 用户可在 LensPin 中通过 HealthKit)/;
  if (!/\/(?:how-it-works|how-to-get-gpx-file|privacy)\//.test(file)) assert.doesNotMatch(s, callouts, file);
  assert.doesNotMatch(plain(s), /Writeback outcome|Completion statuses|XMP sidecar|XMP 附属|\bderivative\b|\bassets?\b|Photos framework|ImageIO|continued-processing task|interpolat|receives a penalty|衍生|资源|框架|插值|惩罚|续行任务/i, file);
  const nav = s.match(/<nav class="desktop-nav"[^>]*>([\s\S]*?)<\/nav>/)[1];
  const labels = [...nav.matchAll(/<a[^>]*>(.*?)<\/a>/g)].map(m => m[1]);
  assert.deepEqual(labels, zh ? ['工作原理', '价格', '教程', '帮助'] : ['How it works', 'Pricing', 'Guides', 'Support']);
  assert.doesNotMatch(plain(s), /No Suggestion|待检查|无建议|one-pin editor|source agreement/);
}
for (const lang of ['en','zh']) {
  const s = read(lang), main = s.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
  const storeName = lang === 'en' ? 'LensPin: Photo Geotagger' : 'LensPin：相机照片补定位';
  const hero = main.match(/<section\b[^>]*class="hero"[^>]*>[\s\S]*?<\/section>/)[0];
  assert.ok(!plain(hero).includes(storeName), 'Store name stays below the hero');
  assert.equal(plain(main).split(storeName).length - 1, 1, 'Store name visible once on home');
  assert.ok(main.match(/<section\b[^>]*id="pricing"[\s\S]*?<\/section>/)[0].includes(`<p class="store-search">${lang === 'en' ? 'Search the App Store for “LensPin: Photo Geotagger”.' : '在 App Store 搜索「LensPin：相机照片补定位」。'}</p>`));
  assert.equal((main.match(/<section\b/g) || []).length, 8);
  for (const key of ['photos','camera','gpx','workout']) assert.ok(main.includes(`data-evidence-tab="${key}"`));
  assert.equal((main.match(/id="pricing"/g) || []).length, 1);
  assert.equal((main.match(/LensPin Unlimited/g) || []).length, 1, 'Full pricing appears once');
  assert.match(main, /HealthKit/);
  assert.doesNotMatch(main, /visionOS|Apple Vision|Vision Pro/i);
  assert.match(main, /100/);
  assert.match(main, /LensPin Unlimited/);
  assert.match(main, lang === 'en' ? /one photo or video counts as one use/ : /每成功为一张照片或一个视频保存位置计一次/);
  if (lang === 'en') assert.doesNotMatch(plain(main), /\bevidence\b/i);
  const contactQuestion = lang === 'en' ? 'How do I contact LensPin?' : '如何联系 LensPin？';
  const contactAnswer = lang === 'en'
    ? 'Use the support contact on the LensPin App Store page. You can also ask in the LensPin community on Reddit.'
    : '请使用 App Store 产品页面上的支持联系方式。也可以在 Reddit 的 LensPin 社区提问。';
  for (const route of ['', '/support']) {
    const page = read(`${lang}${route}`);
    const faq = page.match(new RegExp(`<details><summary>${contactQuestion.replace('?', '\\?')}</summary>([\\s\\S]*?)</details>`))?.[1];
    assert.ok(faq, `${lang}${route}: contact FAQ`);
    assert.equal(contactText(faq), contactAnswer);
    assert.match(faq, /data-app-store-link/);
    assert.match(faq, /href="https:\/\/www\.reddit\.com\/r\/LensPin\/"/);
    const graph = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
    const entry = graph.find(node => node['@type'] === 'FAQPage').mainEntity.find(node => node.name === contactQuestion);
    assert.equal(entry?.acceptedAnswer.text, plain(faq).trim());
  }
  const support = read(`${lang}/support`);
  assert.equal((support.match(/<details><summary>/g) || []).length, 7);
  const contact = support.match(/<section class="content-section" id="contact">[\s\S]*?<\/section>/)?.[0];
  assert.ok(contact);
  assert.ok(contactText(contact).includes(lang === 'en'
    ? 'Ask in the LensPin community or use the support contact on the App Store page.'
    : '前往 LensPin 社区求助，或使用 App Store 页面上的支持联系方式。'));
  assert.match(contact, /data-app-store-link/);
  assert.match(contact, /href="https:\/\/www\.reddit\.com\/r\/LensPin\/"/);
  const privacy = read(`${lang}/privacy`);
  const updates = privacy.match(/<h2>(?:Policy updates|政策更新)<\/h2><p>([\s\S]*?)<\/p>/)?.[1];
  assert.ok(updates);
  assert.ok(updates.includes(`href="/${lang}/support/"`));
  assert.match(updates, /data-app-store-link/);
  assert.ok(contactText(updates).includes(lang === 'en' ? 'support contact shown on the App Store listing.' : 'App Store 产品页面显示的支持联系方式。'));
  for (const phrase of lang === 'en' ? ['GoPro', 'Insta360', 'videos', '100', 'Remove Location', 'Apple Health workout routes'] : ['GoPro', 'Insta360', '视频', '100', '移除位置', '体能训练路线']) assert.ok(support.includes(phrase));
  assert.ok(read(`${lang}/privacy`).includes(lang === 'en' ? 'Share Usage Statistics' : '分享使用统计'));
  const how = plain(read(`${lang}/how-it-works`));
  for (const label of lang === 'en' ? ['High confidence','Review','No clear suggestion'] : ['高可信','需检查','无明确建议']) assert.ok(how.includes(label));
}
console.log(`Verified copy across ${pages.length} HTML files: pricing, navigation, source choices, categories, support FAQs, App Store contact links, email exclusion and forbidden legacy wording.`);

const macBadgeRoutes = ['en', 'zh', 'en/add-location-to-photos-mac', 'en/geotag-photos-gpx-mac', 'zh/add-location-to-photos-mac', 'zh/geotag-photos-gpx-mac'];
for (const file of pages) {
  const route = file.slice(dist.length).replace(/\/index\.html$/, '');
  if (!macBadgeRoutes.includes(route)) assert.doesNotMatch(readFileSync(file, 'utf8'), /data-mac-app-store-badge/, file);
}
for (const route of macBadgeRoutes) {
  const source = read(route), home = !route.includes('/'), zh = route.startsWith('zh');
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
    const downloadSection = source.match(/<section\b[^>]*><div class="prose"><h2>(?:Get LensPin|下载 LensPin)<\/h2>[\s\S]*?<\/section>/)?.[0];
    assert.ok(downloadSection, route);
    assert.match(downloadSection, /data-mac-app-store-badge/);
  }
  assert.doesNotMatch(source, /<div class="download-badges">\s*<\/div>/);
}
console.log('Verified localized Mac badges only in home Mac introductions and Mac guide download sections; home hero/pricing retain single App Store badges.');

// Strava is only a GPX export source for other watches/apps; Apple Watch uses Health.
for (const file of pages) {
  const source = readFileSync(file,'utf8');
  if (!file.includes('/how-to-get-gpx-file/')) assert.doesNotMatch(source,/Strava|WorkOutDoors|OsmAnd|Gaia GPS|Guru Maps/i,file);
  assert.doesNotMatch(source,/15402024-apple-health-and-strava|15401820-strava-apple-watch-app|Apple Workout → Strava|Workouts & Routes/,file);
}

for (const file of pages) {
  const source = readFileSync(file, 'utf8');
  assert.doesNotMatch(source, /<h3\b[^>]*>\s*(?:Added|Failed|Skipped|High confidence|Review|No clear suggestion|新增|失败|跳过|高可信|需检查|无明确建议)\s*<\/h3>/i, file);
  if (file.includes('/zh/')) {
    assert.doesNotMatch(plain(source), /Apple Photos|\bPhotos\b/, `${file}: localized Photos name`);
    assert.doesNotMatch(source, /Apple Photos/, `${file}: localized metadata and JSON-LD`);
    assert.doesNotMatch(plain(source), /\b(?:Sony|Fujifilm|Canon|Nikon)\b/, `${file}: localized camera brands`);
  }
  const footer = source.match(/<footer[\s\S]*?<\/footer>/)?.[0] || '';
  for (const [, heading, links] of footer.matchAll(/<p class="footer-title">(.*?)<\/p><nav class="footer-links">([\s\S]*?)<\/nav>/g)) {
    for (const [, label] of links.matchAll(/<a\b[^>]*>(.*?)<\/a>/g)) assert.notEqual(label, heading, `${file}: footer heading duplicates link`);
  }
}
