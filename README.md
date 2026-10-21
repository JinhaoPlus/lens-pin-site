# LensPin website

Static bilingual product and SEO site for LensPin: English under `/en/` and Simplified Chinese under `/zh/`. Each of the 16 content pages has a language counterpart, including the homepages, tutorials, public user feedback, support and privacy. The deployable output lives in dist/. The linked lenspin-app directory is read-only product reference and must not be modified.

## Local preview

~~~sh
npx wrangler dev --port 4173
~~~

## Validate

~~~sh
npm run check
node --check dist/assets/site.js
~~~

## Cloudflare

Local preview uses Wrangler so `_redirects` and static-asset routing match production. The repository supports either Cloudflare Pages or Workers Static Assets:

- Pages: build command npm run build, output directory dist
- Workers Static Assets: npx wrangler deploy

The production domain `getlenspin.com` is attached to the Worker `lens-pin-site`, which is the name in `wrangler.jsonc`. Verify that target before deployment; the repository directory is named `lenspin-site`.

Every language pair uses reciprocal `en` / `zh-Hans` alternates and English `x-default`. Each page has a self-referencing canonical, localized navigation and a language switch to the same topic. The sitemap includes only the 32 localized canonical URLs. `_redirects` permanently forwards the old English paths (including `/`, `/home` and support aliases) directly to `/en/` counterparts. There is no language sniffing or automatic language-based redirect. Keep old redirects indefinitely; do not reintroduce content at those legacy paths. The build checks for missing translations and unlocalized internal links. Public feedback is a dated summary of linked user reports, not an accuracy benchmark or aggregate rating.

The canonical public origin is centralized as `https://getlenspin.com` in `scripts/site-config.mjs`. `SITE_ORIGIN` may override it for a different deployment. The build uses the origin to generate absolute canonical URLs, `sitemap.xml`, and the Sitemap entry in `robots.txt`.

The App Store URL is centralized in `scripts/site-config.mjs`. It points to the public LensPin listing (`6812626038`); set `APP_STORE_URL` in the build environment only to override it. Every header, page CTA, footer link, download event, SoftwareApplication entry, and Smart App Banner uses that value. The same file references the locally served official black App Store badge at `dist/assets/download-on-the-app-store.svg` and the Simplified Chinese version at `dist/assets/download-on-the-app-store-zh.svg`; keep both artworks unmodified. Its source is Apple's Marketing Tools endpoint, documented in the configuration. Serving it locally avoids external redirects and CSP failures.

Website downloads use the App Store Connect campaign token `getlenspin_website` (`ct`), with provider token `129459678` (`pt`) and media type `8` (`mt`). Safari Smart App Banners receive these parameters through `affiliate-data` as well. This identifies downloads attributed to the website link; it does not distinguish how visitors originally reached the website. Campaign statistics become visible only after Apple's reporting thresholds are met.

Use `npm run build:production` for release builds. It fails early when a valid HTTPS origin is unavailable or the App Store placeholder is still present, preventing relative canonical URLs or a fake download destination from reaching production.

The working site uses supplied original screenshots in every LensPin product-image slot and in the Apple Photos single-photo tutorial. There are no remaining visible asset placeholders. A production build still fails if a future `data-asset-placeholder` is introduced, so temporary cards cannot be mistaken for finished product imagery.

The official App Store badge appears once on each acquisition/product page. Support, formats, and privacy pages use a plain App Store text link in the footer instead of repeating the badge.

Cloudflare Pages reads security and cache policy from dist/_headers. wrangler.jsonc configures static asset routing, canonical trailing slashes, and the custom 404.html for Workers deployment.

## Language navigation and new locales

The header has one independent language dropdown on desktop and mobile. It uses native language names, marks the current language, and links directly to the same topic. Native details/summary and ordinary links remain usable without JavaScript. JavaScript adds outside-click, focus-leave and Escape dismissal and keeps the language and mobile menus from overlapping. Narrow screens show a compact current-language label; long lists scroll within the viewport.

`scripts/site-locales.mjs` is the language registry: URL prefix, HTML/hreflang language, native and compact names, Open Graph locale, official badge and shared navigation/footer messages. Routing, the dropdown and SEO alternates read this registry. To add a language, prepare its homepage and shared navigation/footer destinations, supply translated page content and interface strings, then register the locale. Only existing counterparts appear in a page's dropdown or hreflang set. Untranslated topics stay absent rather than linking to a missing page or an unrelated homepage. The English counterpart remains required for x-default. Translate interactive page copy in `dist/assets/site.js` when introducing another language; adding a registry entry does not translate product content.
