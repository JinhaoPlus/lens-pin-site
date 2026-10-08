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

The canonical public origin is centralized as `https://getlenspin.com` in `scripts/site-config.mjs`. `SITE_ORIGIN` may override it for a different deployment. The build uses the origin to generate absolute canonical URLs, `sitemap.xml`, and the Sitemap entry in `robots.txt`.

The App Store URL is centralized in `scripts/site-config.mjs`. It points to the public LensPin listing (`6812626038`); set `APP_STORE_URL` in the build environment only to override it. Every header, page CTA, footer link, download event, SoftwareApplication entry, and Smart App Banner uses that value. The same file references the locally served official black App Store badge at `dist/assets/download-on-the-app-store.svg`; keep that artwork unmodified. Its source is Apple's Marketing Tools endpoint, documented in the configuration. Serving it locally avoids external redirects and CSP failures.

Use `npm run build:production` for release builds. It fails early when a valid HTTPS origin is unavailable or the App Store placeholder is still present, preventing relative canonical URLs or a fake download destination from reaching production.

The working site uses supplied original screenshots in every LensPin product-image slot and in the Apple Photos single-photo tutorial. There are no remaining visible asset placeholders. A production build still fails if a future `data-asset-placeholder` is introduced, so temporary cards cannot be mistaken for finished product imagery.

The official App Store badge appears once on each acquisition/product page. Support, formats, and privacy pages use a plain App Store text link in the footer instead of repeating the badge.

Cloudflare Pages reads security and cache policy from dist/_headers. wrangler.jsonc configures static asset routing, canonical trailing slashes, and the custom 404.html for Workers deployment.
