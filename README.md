# LensPin website

Static, English-first product and SEO site for LensPin. The deployable output lives in dist/. The linked lenspin-app directory is read-only product reference and must not be modified.

## Local preview

~~~sh
python3 -m http.server 4173 --directory dist
~~~

## Validate

~~~sh
npm run check
node --check dist/assets/site.js
~~~

## Cloudflare

The repository supports either Cloudflare Pages or Workers Static Assets:

- Pages: build command npm run build, output directory dist
- Workers Static Assets: npx wrangler deploy

Set SITE_ORIGIN to the final public origin, such as https://example.com, in the Cloudflare build environment. The build uses it to generate an absolute sitemap.xml and the Sitemap entry in robots.txt.

The App Store URL is centralized in `scripts/site-config.mjs`. Replace the placeholder URL there after App Store Connect provides the listing, or set `APP_STORE_URL` in the build environment. Every header, page CTA, footer link, download event, SoftwareApplication entry, and Smart App Banner uses that value. The same file references Apple's hosted, preferred black App Store badge; keep that artwork unmodified.

Use `npm run build:production` for release builds. It fails early when `SITE_ORIGIN` is missing or the App Store placeholder is still present, preventing relative canonical URLs or a fake download destination from reaching production.

The working site now uses eight supplied original App screenshots in every LensPin product-image slot. Two visible instructional placeholders remain: an iPhone/SD-card-reader import photo and an Apple Photos Adjust Location screen. See `Docs/WEBSITE_ASSET_SLOTS.md` for their exact crop, privacy, and export requirements. A production build fails while any `data-asset-placeholder` remains, so a temporary card cannot be mistaken for finished product imagery.

The official App Store badge appears once on each acquisition/product page. Support, formats, and privacy pages use a plain App Store text link in the footer instead of repeating the badge.

Cloudflare Pages reads security and cache policy from dist/_headers. wrangler.jsonc configures static asset routing, canonical trailing slashes, and the custom 404.html for Workers deployment.
