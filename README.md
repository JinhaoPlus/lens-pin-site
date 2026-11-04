# LensPin website

Static bilingual product and SEO site for LensPin: English under `/en/` and Simplified Chinese under `/zh/`. There are 35 canonical pages: 16 topics with both languages, plus three English-only guides. The deployable output lives in dist/. HTML bodies and static assets in `dist/` are also the maintained source: there is no separate content directory. Edit page-specific copy there; edit shared navigation/footer in `scripts/site-locales.mjs` / `scripts/site-shell.mjs` and generated SEO in `scripts/site-seo.mjs`, then rebuild. Shared badge sizing and secondary text-link layout is maintained in `scripts/cta-styles.css`; the builder writes its marked block into `dist/assets/styles.css` before generating asset versions. The linked lenspin-app directory is read-only product reference and must not be modified.

## Local preview

~~~sh
npx wrangler dev --port 4173
~~~

## Validate

~~~sh
npm run build:production
npm run check
npm run verify:seo
npm run verify:guides
npm run verify:artwork
npm run verify:copy
npm run verify:structure
npm run verify:redirects
node --check dist/assets/site.js
~~~

`verify:structure` also rejects raw GPX element tags inside code/pre samples and CJK characters in English visible text, except inside the language switcher or the intentional Chinese App Store name. Write XML examples with `&lt;` and `&gt;` so they display as text; the build derives FAQ JSON-LD from that visible copy.

## Cloudflare

Local preview uses Wrangler so `_redirects` and static-asset routing match production. The repository supports either Cloudflare Pages or Workers Static Assets:

- Pages: build command npm run build, output directory dist
- Workers Static Assets: npx wrangler deploy

The production domain `getlenspin.com` is attached to the Worker `lens-pin-site`, which is the name in `wrangler.jsonc`. Verify that target before deployment; the repository directory is named `lenspin-site`.

Every language pair uses reciprocal `en` / `zh-Hans` alternates and English `x-default`. Each page has a self-referencing canonical, localized navigation and a language switch listing available versions of the same topic. The sitemap includes all 35 localized canonical URLs with XML alternates only for existing counterparts; English-only guides list `en` and `x-default`. `_redirects` permanently forwards old English paths (including `/home` and support aliases) to `/en/` counterparts. The Worker handles `/` first with an uncached 302 based on `Accept-Language` (English fallback), and redirects `/en` and `/zh` to their trailing-slash URLs. Start `npx wrangler dev --ip 127.0.0.1 --port 4196` before running `verify:redirects` (or set `REDIRECT_TEST_ORIGIN` to another local preview origin). Keep old redirects indefinitely; do not reintroduce content at those legacy paths. The build checks for broken localized internal links, rejects relative and same-origin absolute links to any 301 source, and emits alternates only for existing pages. Chinese scenario pages explicitly label their link to the English primary camera-photo guide; other cross-language navigation still preserves the topic. `verify:redirects` exercises every `_redirects` 301 and requires its exact target to return 200 without a second redirect. Sitemap dates preserve existing values for unchanged pages; changed pages declare `last-modified` metadata, matching visible update dates and JSON-LD `dateModified`. Public feedback is a dated summary of linked user reports, not an accuracy benchmark or aggregate rating.

The canonical public origin is centralized as `https://getlenspin.com` in `scripts/site-config.mjs`. `SITE_ORIGIN` may override it for a different deployment. The build uses the origin to generate absolute canonical URLs, `sitemap.xml`, and the Sitemap entry in `robots.txt`.

The App Store URL is centralized in `scripts/site-config.mjs`. It points to the public LensPin listing (`6812626038`); set `APP_STORE_URL` in the build environment only to override it. Every header, page CTA, footer link, download event, SoftwareApplication entry, and Smart App Banner uses that value. The same file references the locally served official black App Store badge at `dist/assets/download-on-the-app-store.svg` and the Simplified Chinese version at `dist/assets/download-on-the-app-store-zh.svg`; keep both artworks unmodified. Its source is Apple's Marketing Tools endpoint, documented in the configuration. Serving it locally avoids external redirects and CSP failures.

Website downloads use per-page App Store Connect campaign tokens (`ct`): `web_home_en`, `web_home_zh`, and `web_<topic>_<locale>` for other pages (long route names use readable aliases in `scripts/site-seo.mjs`, keeping tokens within 30 characters), with provider token `129459678` (`pt`) and media type `8` (`mt`). `scripts/site-seo.mjs` generates the same page token for every CTA, JSON-LD download URL, and Smart App Banner. Safari Smart App Banners receive these parameters through `affiliate-data` as well. This distinguishes the referring website page; it does not distinguish how visitors originally reached the website. Campaign statistics become visible only after Apple's reporting thresholds are met.

Use `npm run build:production` for release builds. It fails early when a valid HTTPS origin is unavailable or the App Store placeholder is still present, preventing relative canonical URLs or a fake download destination from reaching production.

The working site uses supplied original screenshots in every LensPin product-image slot and in the Apple Photos single-photo tutorial. There are no remaining visible asset placeholders. A production build still fails if a future `data-asset-placeholder` is introduced, so temporary cards cannot be mistaken for finished product imagery.

The official App Store badge appears once on each acquisition/product page. Support, formats, and privacy pages use a plain App Store text link in the footer instead of repeating the badge.

Cloudflare Pages reads security and cache policy from dist/_headers. wrangler.jsonc configures static asset routing, canonical trailing slashes, and the custom 404.html for Workers deployment.

## Language navigation and new locales

The header has one independent language dropdown on desktop and mobile. It uses native language names, marks the current language, and links directly to the same topic. Native details/summary and ordinary links remain usable without JavaScript. JavaScript adds outside-click, focus-leave and Escape dismissal and keeps the language and mobile menus from overlapping. Narrow screens show a compact current-language label; long lists scroll within the viewport.

`scripts/site-locales.mjs` is the language registry: URL prefix, HTML/hreflang language, native and compact names, Open Graph locale, official badge and shared navigation/footer messages. Routing, the dropdown and SEO alternates read this registry. To add a language, prepare its homepage and shared navigation/footer destinations, supply translated page content and interface strings, then register the locale. Only existing counterparts appear in a page's dropdown or hreflang set. Untranslated topics stay absent rather than linking to a missing page or an unrelated homepage. An English counterpart is required to emit x-default. Translate interactive page copy in `dist/assets/site.js` when introducing another language; adding a registry entry does not translate product content.

## SEO and analytics checks

`npm run build:production` refreshes social metadata, Organization/WebSite entities on both homepages, free-download SoftwareApplication offers, and FAQPage entities derived from visible FAQ answers. `npm run verify:seo` checks the actual generated files (not an in-memory rebuild), page campaigns, social metadata, FAQ parity, sitemap alternates, and unchanged CSP directives. Decorative images with `aria-hidden` containers intentionally keep empty alt text; content images have descriptive alt text.

The shared social card is `dist/assets/lenspin-social.png` (1200×630), composed from the existing coastal photo and LensPin icon. Recreate it on macOS with `python3 scripts/create-social-image.py` (Pillow required; uses the system Arial font).

The `/en/guides/` and `/zh/guides/` directories list every guide in that language, grouped into adding/importing, GPX/reference sources, and troubleshooting/matching. The November 5 restructuring merges GPX acquisition/recording/watch export into one `/how-to-get-gpx-file/` per language, and missing/wrong/map-location troubleshooting into the paired `/camera-photos-no-location/` pages. Retired localized and legacy GPX URLs redirect directly to the merged pages. Apple Watch uses read-only Health workout routes without GPX; Strava is covered only for other watches/apps.

The primary English workflow is `/en/add-location-to-camera-photos-apple-photos/`; iPhone/iPad, Mac and no-GPX reference-photo pages retain their own scenarios and link to it. How it works explains time matching and ends with a shared App Store download badge. `npm run verify:guides` checks seven long-form article bodies, their pricing and lengths (the focused Chinese iPhone article has a 1,400-character minimum after removing its duplicated batch steps), Article metadata, homepage/directory links, fragments, reciprocal language counterparts, complete guide directories, merged source sections and the final matching-page CTA. Apple operation references appear next to the relevant instructions.

CSP adds only `https://static.cloudflareinsights.com` to `script-src` and `https://cloudflareinsights.com` to `connect-src`. No Web Analytics beacon snippet or token is maintained in this repository. Cloudflare may inject one at the edge; CSP permission alone does not enable analytics. Confirm injection and incoming events on production after an approved deployment.

Mac download badges use the separate `macAppStoreUrl` in `scripts/site-config.mjs` (`ct=website_mac&mt=12`). The English and Simplified Chinese SVGs are unmodified artwork from Apple's Marketing Tools endpoint documented there. Both homepages show a single Mac badge only in their Mac app introduction (`#mac-app`); the hero and pricing sections keep only the App Store badge. The Mac guides show paired badges in their download section. Mac links use `data-mac-app-store-link` so iOS campaign rewriting preserves their destination.
