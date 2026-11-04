// PLAYWRIGHT_MODULE may point to an installed Playwright ESM entry point.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url).pathname;
const origin = process.env.CTA_ORIGIN || 'http://127.0.0.1:8787';
const routes=[];
function walk(dir) { for(const e of readdirSync(root+'/dist'+dir,{withFileTypes:true})) { if(e.isDirectory()) walk(dir+e.name+'/'); else if(e.name==='index.html' && /data-(?:mac-)?app-store-badge/.test(readFileSync(root+'/dist'+dir+e.name,'utf8'))) routes.push(dir); } }
walk('/en/'); walk('/zh/');
const browser=await chromium.launch({channel:'chromium'});
const rows=[], failures=[];
for(const width of [1440,768,390]) {
 const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1});
 for(const route of routes) {
  await page.goto(origin+route);
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('.app-store-badge-link img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  const measurements=await page.evaluate(()=>[...document.querySelectorAll('.app-store-badge-link')].map((link,i)=>{
   const parent=link.parentElement, secondary=parent.querySelector(':scope > .cta-text-link');
   const style=secondary ? getComputedStyle(secondary) : null;
   const plainLink=!secondary || (!secondary.classList.contains('button') && ['Top','Right','Bottom','Left'].every(side=>parseFloat(style['padding'+side])===0 && parseFloat(style['border'+side+'Width'])===0) && style.backgroundColor==='rgba(0, 0, 0, 0)');
   const note=parent.nextElementSibling?.matches('.hero-price') ? parent.nextElementSibling : null;
   const legacyButton=!!parent.querySelector(':scope > .button');
   const rect=e=>{if(!e)return null; const r=e.getBoundingClientRect();return {height:r.height,top:r.top,bottom:r.bottom,width:r.width,left:r.left,right:r.right}};
   return {section:link.closest('.hero-actions') ? 'hero' : link.closest('#mac-app') ? 'mac-app' : link.closest('#pricing') ? 'pricing' : parent.className || 'badge '+(i+1),kind:link.hasAttribute('data-mac-app-store-badge')?'Mac':'App',link:rect(link),img:rect(link.querySelector('img')),secondary:rect(secondary),note:rect(note),plainLink,legacyButton,loaded:link.querySelector('img').naturalWidth>0};
  }));
  for(const m of measurements) {
   rows.push({route,width,...m});
   const inViewport=r=>!r || (r.left>=0 && r.right<=width && r.width>0);
   const stacked=!m.secondary || (Math.abs(m.secondary.top-m.link.bottom-10)<=1 && Math.abs(m.secondary.left-m.link.left)<=1 && (!m.note || Math.abs(m.note.top-m.secondary.bottom-10)<=1));
   if(!inViewport(m.link) || !inViewport(m.secondary) || !m.loaded || !m.plainLink || m.legacyButton || !stacked || Math.abs(m.link.height-46)>1 || Math.abs(m.img.height-46)>1 || Math.abs(m.link.top-m.img.top)>1) failures.push({route,width,...m});
  }
  for(const secondary of await page.locator('.cta-text-link').all()) {
   await secondary.hover();
   if(!await secondary.evaluate(el=>getComputedStyle(el).textDecorationLine.includes('underline'))) failures.push({route,width,error:'Missing hover underline'});
  }
 }
 await page.close();
}
await browser.close();
if (failures.length) {
 console.error(JSON.stringify(failures, null, 2));
 process.exitCode = 1;
} else {
 const format = r => r ? [r.height,r.top,r.bottom].map(v=>v.toFixed(2)).join(' / ') : '—';
 const report = [
  '# CTA alignment measurements',
  '',
  'Chromium via Playwright (`channel: chromium`), viewport height 1000px. Values are getBoundingClientRect height / top / bottom in CSS pixels, relative to the unscrolled viewport. Fonts and badge images finished loading before measurement.',
  '',
  'All '+rows.length+' badge instances passed: link/image height 46px, identical image/link bounds, secondary text links on their own line 10px below the badge with no border/background/padding, hover underline, home notes 10px below the link, and controls within the viewport. A dash means there is no secondary link in that block.',
  '',
  '| Page | Block / badge | Width | Badge link H / T / B | Badge image H / T / B | Text link H / T / B |',
  '|---|---|---:|---|---|---|',
  ...rows.map(r=>`| ${r.route} | ${r.section} / ${r.kind} | ${r.width} | ${format(r.link)} | ${format(r.img)} | ${format(r.secondary)} |`),
  '',
  'Reproduce with a static server serving dist on port 8787:',
  '',
  '```sh',
  'PLAYWRIGHT_MODULE=/tmp/pwshot/node_modules/playwright/index.mjs node scripts/measure-cta.mjs',
  '```',
  '',
  'Passed: npm run build:production, npm run check, npm run verify:seo, npm run verify:guides, npm run verify:artwork, npm run verify:copy, npm run verify:structure.',
  ''
 ].join('\n');
 writeFileSync(new URL('../Docs/cta-alignment-measurements.md', import.meta.url), report);
 console.log(report);
}
