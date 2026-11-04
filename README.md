# LensPin website

Static bilingual product and SEO site for LensPin: English under `/en/` and Simplified Chinese under `/zh/`. There are 40 canonical pages: 18 topics with both languages, plus four English-only guides. The deployable output lives in dist/. HTML bodies and static assets in `dist/` are also the maintained source: there is no separate content directory. Edit page-specific copy there; edit shared navigation/footer in `scripts/site-locales.mjs` / `scripts/site-shell.mjs` and generated SEO in `scripts/site-seo.mjs`, then rebuild. Shared badge/button sizing is maintained in `scripts/cta-styles.css`; the builder writes its marked block into `dist/assets/styles.css` before generating asset versions. The linked lenspin-app directory is read-only product reference and must not be modified.

## Local preview

~~~sh
npx wrangler dev --port 4173
~~~

## Validate

~~~sh
npm run check
npm run verify:seo
npm run verify:guides
node --check dist/assets/site.js
~~~

## Cloudflare

Local preview uses Wrangler so `_redirects` and static-asset routing match production. The repository supports either Cloudflare Pages or Workers Static Assets:

- Pages: build command npm run build, output directory dist
- Workers Static Assets: npx wrangler deploy

The production domain `getlenspin.com` is attached to the Worker `lens-pin-site`, which is the name in `wrangler.jsonc`. Verify that target before deployment; the repository directory is named `lenspin-site`.

Every language pair uses reciprocal `en` / `zh-Hans` alternates and English `x-default`. Each page has a self-referencing canonical, localized navigation and a language switch listing available versions of the same topic. The sitemap includes all 40 localized canonical URLs with XML alternates only for existing counterparts; English-only guides list `en` and `x-default`. `_redirects` permanently forwards the old English paths (including `/`, `/home` and support aliases) directly to `/en/` counterparts. There is no language sniffing or automatic language-based redirect. Keep old redirects indefinitely; do not reintroduce content at those legacy paths. The build checks for missing English counterparts and unlocalized internal links. Public feedback is a dated summary of linked user reports, not an accuracy benchmark or aggregate rating.

The canonical public origin is centralized as `https://getlenspin.com` in `scripts/site-config.mjs`. `SITE_ORIGIN` may override it for a different deployment. The build uses the origin to generate absolute canonical URLs, `sitemap.xml`, and the Sitemap entry in `robots.txt`.

The App Store URL is centralized in `scripts/site-config.mjs`. It points to the public LensPin listing (`6812626038`); set `APP_STORE_URL` in the build environment only to override it. Every header, page CTA, footer link, download event, SoftwareApplication entry, and Smart App Banner uses that value. The same file references the locally served official black App Store badge at `dist/assets/download-on-the-app-store.svg` and the Simplified Chinese version at `dist/assets/download-on-the-app-store-zh.svg`; keep both artworks unmodified. Its source is Apple's Marketing Tools endpoint, documented in the configuration. Serving it locally avoids external redirects and CSP failures.

Website downloads use per-page App Store Connect campaign tokens (`ct`): `web_home_en`, `web_home_zh`, and `web_<topic>_<locale>` for other pages (long route names use readable aliases in `scripts/site-seo.mjs`, keeping tokens within 30 characters), with provider token `129459678` (`pt`) and media type `8` (`mt`). `scripts/site-seo.mjs` generates the same page token for every CTA, JSON-LD download URL, and Smart App Banner. Safari Smart App Banners receive these parameters through `affiliate-data` as well. This distinguishes the referring website page; it does not distinguish how visitors originally reached the website. Campaign statistics become visible only after Apple's reporting thresholds are met.

Use `npm run build:production` for release builds. It fails early when a valid HTTPS origin is unavailable or the App Store placeholder is still present, preventing relative canonical URLs or a fake download destination from reaching production.

The working site uses supplied original screenshots in every LensPin product-image slot and in the Apple Photos single-photo tutorial. There are no remaining visible asset placeholders. A production build still fails if a future `data-asset-placeholder` is introduced, so temporary cards cannot be mistaken for finished product imagery.

The official App Store badge appears once on each acquisition/product page. Support, formats, and privacy pages use a plain App Store text link in the footer instead of repeating the badge.

Cloudflare Pages reads security and cache policy from dist/_headers. wrangler.jsonc configures static asset routing, canonical trailing slashes, and the custom 404.html for Workers deployment.

## Language navigation and new locales

The header has one independent language dropdown on desktop and mobile. It uses native language names, marks the current language, and links directly to the same topic. Native details/summary and ordinary links remain usable without JavaScript. JavaScript adds outside-click, focus-leave and Escape dismissal and keeps the language and mobile menus from overlapping. Narrow screens show a compact current-language label; long lists scroll within the viewport.

`scripts/site-locales.mjs` is the language registry: URL prefix, HTML/hreflang language, native and compact names, Open Graph locale, official badge and shared navigation/footer messages. Routing, the dropdown and SEO alternates read this registry. To add a language, prepare its homepage and shared navigation/footer destinations, supply translated page content and interface strings, then register the locale. Only existing counterparts appear in a page's dropdown or hreflang set. Untranslated topics stay absent rather than linking to a missing page or an unrelated homepage. The English counterpart remains required for x-default. Translate interactive page copy in `dist/assets/site.js` when introducing another language; adding a registry entry does not translate product content.

## SEO and analytics checks

`npm run build:production` refreshes social metadata, Organization/WebSite entities on both homepages, free-download SoftwareApplication offers, and FAQPage entities derived from visible FAQ answers. `npm run verify:seo` checks the actual generated files (not an in-memory rebuild), page campaigns, social metadata, FAQ parity, sitemap alternates, and unchanged CSP directives. Decorative images with `aria-hidden` containers intentionally keep empty alt text; content images have descriptive alt text.

The shared social card is `dist/assets/lenspin-social.png` (1200×630), composed from the existing coastal photo and LensPin icon. Recreate it on macOS with `python3 scripts/create-social-image.py` (Pillow required; uses the system Arial font).

The `/en/guides/` and `/zh/guides/` directories, homepage cards, header and footer expose the how-to guides. The November 4 content set adds five English guides and one Chinese troubleshooting guide, and expands the existing Chinese add-location and import guides. These use Article JSON-LD; directories use CollectionPage. `npm run verify:guides` checks all eight article bodies for requested lengths, pricing wording, useful steps before the batch option, Article metadata, homepage/directory links, local fragments and existing language counterparts. Apple operation references are linked next to the relevant instructions; interface labels can vary by OS version.

CSP adds only `https://static.cloudflareinsights.com` to `script-src` and `https://cloudflareinsights.com` to `connect-src`. No Web Analytics beacon snippet or token is maintained in this repository. Cloudflare may inject one at the edge; CSP permission alone does not enable analytics. Confirm injection and incoming events on production after an approved deployment.

Mac download badges use the separate `macAppStoreUrl` in `scripts/site-config.mjs` (`ct=website_mac&mt=12`). The English and Simplified Chinese SVGs are unmodified artwork from Apple's Marketing Tools endpoint documented there. Both homepages show a single Mac badge only in their Mac app introduction (`#mac-app`); the hero and pricing sections keep only the App Store badge. The Mac guides show paired badges in their download section. Mac links use `data-mac-app-store-link` so iOS campaign rewriting preserves their destination.
