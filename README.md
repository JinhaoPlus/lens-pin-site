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

Cloudflare Pages reads security and cache policy from dist/_headers. wrangler.jsonc configures static asset routing, canonical trailing slashes, and the custom 404.html for Workers deployment.

The App Store listing URL is intentionally not invented. Replace support-page availability links with the attributed App Store campaign URL when the listing exists.
