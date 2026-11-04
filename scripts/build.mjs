import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, sep } from "node:path";
import { campaignUrl, prepareSeo } from "./site-seo.mjs";
import { siteConfig } from "./site-config.mjs";
import { contentPath, localizedPath, renderAppStoreBadge, renderFooter, renderHeader } from "./site-shell.mjs";
import { defaultLanguage, localeFor, siteLocales } from "./site-locales.mjs";

const dist = new URL("../dist/", import.meta.url);
const distPath = dist.pathname;
const siteOrigin = (process.env.SITE_ORIGIN || siteConfig.siteOrigin || "").replace(/\/+$/, "");
const appStoreUrl = (process.env.APP_STORE_URL || siteConfig.appStoreUrl).trim();
const isCheckOnly = process.argv.includes("--check");
const isProduction = process.argv.includes("--production");
const errors = [];
const assetVersion = createHash("sha256")
  .update(readFileSync(new URL("assets/styles.css", dist)))
  .update(readFileSync(new URL("assets/site.js", dist)))
  .digest("hex")
  .slice(0, 10);

if (isProduction && !siteOrigin) {
  console.error("SITE_ORIGIN is required for a production build so canonical URLs and sitemap entries are absolute.");
  process.exit(1);
}

if (siteOrigin) {
  try {
    const parsedSiteOrigin = new URL(siteOrigin);
    const isHttpsRootOrigin = parsedSiteOrigin.protocol === "https:"
      && !parsedSiteOrigin.username
      && !parsedSiteOrigin.password
      && parsedSiteOrigin.pathname === "/"
      && !parsedSiteOrigin.search
      && !parsedSiteOrigin.hash
      && parsedSiteOrigin.origin === siteOrigin;
    if (!isHttpsRootOrigin) throw new Error();
  } catch {
    console.error("SITE_ORIGIN must be a bare HTTPS origin such as https://example.com, without a path, query, or fragment.");
    process.exit(1);
  }
}

if (!/^https:\/\/apps\.apple\.com\//.test(appStoreUrl)) {
  console.error("APP_STORE_URL must be an https://apps.apple.com/ URL.");
  process.exit(1);
}

for (const badgeUrl of new Set(siteLocales.map((locale) => locale.badgeUrl))) {
  if (!/^\/assets\/[^/]+\.svg$/.test(badgeUrl)) throw new Error('Use local, unmodified official App Store artwork.');
  const badgePath = join(distPath, badgeUrl.slice(1));
  if (!existsSync(badgePath) || !readFileSync(badgePath, "utf8").includes("<svg")) {
    console.error("The official App Store SVG badge is missing or invalid: " + badgeUrl);
    process.exit(1);
  }
}
const headersSource = readFileSync(new URL("_headers", dist), "utf8");
if (!/img-src[^;]*'self'/.test(headersSource)) {
  console.error("dist/_headers must allow same-origin badge images in img-src.");
  process.exit(1);
}

if (isProduction && appStoreUrl.includes(`id${siteConfig.appStorePlaceholderId}`)) {
  console.error("Replace the placeholder App Store URL in scripts/site-config.mjs or set APP_STORE_URL before a production build.");
  process.exit(1);
}

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const htmlFiles = walk(distPath).filter((file) => file.endsWith(".html"));
const titles = new Map();
const canonicals = new Map();
const preparedSources = new Map();
const marketingRoutes = new Set([
  "/",
  "/import-camera-photos-to-iphone/",
  "/add-location-to-photos-iphone/",
  "/how-it-works/",
  "/gpx-photo-geotagging-iphone/",
  "/geotag-dslr-photos-with-iphone-photos/",
]);

function localTarget(href) {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean || !clean.startsWith("/")) return null;
  if (clean === "/") return join(distPath, "index.html");
  const withoutLeadingSlash = clean.slice(1);
  if (clean.endsWith("/")) return join(distPath, withoutLeadingSlash, "index.html");
  return join(distPath, withoutLeadingSlash);
}

function routeFor(file) {
  const path = relative(distPath, file).split(sep).join("/");
  return path === "index.html" ? "/" : "/" + path.replace(/index\.html$/, "");
}

function availableLocales(path) {
  return siteLocales.filter((locale) => existsSync(localTarget(localizedPath(locale.code, path))));
}

function alternatesFor(path) {
  const locales = availableLocales(path);
  const alternates = locales.map((locale) => [locale.htmlLang, localizedPath(locale.code, path)]);
  if (locales.some((locale) => locale.code === defaultLanguage)) alternates.push(["x-default", localizedPath(defaultLanguage, path)]);
  return alternates;
}

function prepareSource(file) {
  const label = relative(distPath, file).split(sep).join("/");
  const path = routeFor(file);
  const locale = localeFor(path);
  const pageAppStoreUrl = campaignUrl(appStoreUrl, label === "404.html" ? "/en/404/" : path);
  let source = readFileSync(file, "utf8");
  if (label !== "404.html") {
    source = source.replace(/<header class="site-header">[\s\S]*?<\/header>/, renderHeader(path, pageAppStoreUrl, availableLocales(path)));
    source = source.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, "<!-- SITE_FOOTER -->");

    if (marketingRoutes.has(contentPath(path)) && !/data-app-store-badge/.test(source)) {
      source = source.replace(
        /<a class="button button-primary" href="[^"]*" data-app-store-link target="_blank" rel="noopener">Download on the App Store<\/a>/,
        renderAppStoreBadge(pageAppStoreUrl, siteConfig.appStoreBadgeUrl)
      );
    }

    source = source.replace(
      /(<a class="button button-primary" href="[^"]*" data-app-store-link target="_blank" rel="noopener">)Download on the App Store(<\/a>)/g,
      "$1View LensPin on the App Store$2"
    );

    source = source.replace(
      "<!-- SITE_FOOTER -->",
      renderFooter(pageAppStoreUrl, path)
    );
  }
  source = source.replace(/href="[^"]*"\s+data-app-store-link/g, `href="${pageAppStoreUrl}" data-app-store-link`);
  source = source.replace(
    /(<img class="app-store-badge-image" src=")[^"]+("[^>]*>)/g,
    `$1${locale.badgeUrl}$2`
  );
  source = source.replace(/(data-app-store-badge[^>]*aria-label=")[^"]+"/g, `$1${locale.ui.badgeLabel}"`)
    .replace(/(<img class="app-store-badge-image"[^>]*alt=")[^"]+"/g, `$1${locale.ui.badgeAlt}"`);
  source = source.replace(/"downloadUrl":"[^"]+"/g, `"downloadUrl":"${pageAppStoreUrl}"`);
  source = source.replace(/\/assets\/styles\.css(?:\?v=[^"]*)?/g, `/assets/styles.css?v=${assetVersion}`);
  source = source.replace(/\/assets\/site\.js(?:\?v=[^"]*)?/g, `/assets/site.js?v=${assetVersion}`);
  source = source.replace(/\n?\s*<meta name="apple-itunes-app" content="[^"]+">/g, "");
  const appId = pageAppStoreUrl.match(/\/id(\d+)/)?.[1];
  if (appId && appId !== siteConfig.appStorePlaceholderId && label !== "404.html") {
    const campaignParameters = new URL(pageAppStoreUrl).searchParams;
    const affiliateData = new URLSearchParams();
    for (const parameter of ["pt", "ct", "mt"]) {
      if (campaignParameters.has(parameter)) affiliateData.set(parameter, campaignParameters.get(parameter));
    }
    const campaignAttribute = affiliateData.size ? `, affiliate-data=${affiliateData.toString().replaceAll("&", "&amp;")}` : "";
    source = source.replace(/(<meta name="viewport"[^>]*>)/, `$1\n  <meta name="apple-itunes-app" content="app-id=${appId}${campaignAttribute}">`);
  }
  return prepareSeo(source, path, siteOrigin, pageAppStoreUrl);
}

for (const file of htmlFiles) preparedSources.set(file, prepareSource(file));

for (const file of htmlFiles) {
  const source = preparedSources.get(file);
  const label = relative(distPath, file).split(sep).join("/");
  const title = source.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
  const description = source.match(/<meta name="description" content="([^"]+)">/)?.[1]?.trim();
  const h1Count = (source.match(/<h1(?:\s|>)/g) || []).length;
  const canonical = source.match(/<link rel="canonical" href="([^"]+)">/)?.[1]?.trim();
  const isNotFoundPage = label === "404.html";
  const appStoreBadgeCount = (source.match(/data-app-store-badge/g) || []).length;
  const assetPlaceholderCount = (source.match(/data-asset-placeholder/g) || []).length;

  if (!title) errors.push(label + ": missing title");
  if (!description) errors.push(label + ": missing meta description");
  if (h1Count !== 1) errors.push(label + ": expected one h1, found " + h1Count);
  const expectedLanguage = localeFor(routeFor(file)).htmlLang;
  if (!source.includes(`<html lang="${expectedLanguage}">`)) errors.push(label + ": expected html lang=" + expectedLanguage);
  if (!/<meta name="viewport"/.test(source)) errors.push(label + ": missing viewport meta tag");
  if (!canonical && !isNotFoundPage) errors.push(label + ": missing canonical");
  if (!isNotFoundPage && !/<meta property="og:type"/.test(source)) errors.push(label + ": missing og:type");
  if (!isNotFoundPage && !/<meta property="og:title"/.test(source)) errors.push(label + ": missing og:title");
  if (!isNotFoundPage && !/<meta property="og:description"/.test(source)) errors.push(label + ": missing og:description");
  if (!isNotFoundPage && !/<script type="application\/ld\+json">/.test(source)) errors.push(label + ": missing JSON-LD");
  if (!isNotFoundPage && !/data-app-store-link/.test(source)) errors.push(label + ": missing App Store download link");
  if (!isNotFoundPage && marketingRoutes.has(contentPath(routeFor(file))) && appStoreBadgeCount !== 1) {
    errors.push(label + ": expected one official App Store badge, found " + appStoreBadgeCount);
  }
  if (!isNotFoundPage && !marketingRoutes.has(contentPath(routeFor(file))) && appStoreBadgeCount !== 0) {
    errors.push(label + ": utility pages must not contain an official App Store badge");
  }
  if (isProduction && assetPlaceholderCount > 0) {
    errors.push(label + ": replace " + assetPlaceholderCount + " asset placeholder(s) before production");
  }
  if (title && title.replace(/&amp;/g, "&").length > 65) errors.push(label + ": title is longer than 65 characters");
  if (description && description.length > 160) errors.push(label + ": meta description is longer than 160 characters");

  for (const image of source.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="[^"]*"/.test(image[0])) errors.push(label + ": image is missing alt text");
  }

  for (const block of source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(block[1]);
    } catch {
      errors.push(label + ": invalid JSON-LD");
    }
  }

  if (title && !isNotFoundPage) {
    if (titles.has(title)) errors.push(label + ": duplicate title with " + titles.get(title));
    titles.set(title, label);
  }
  if (canonical) {
    if (!isNotFoundPage && canonical !== siteOrigin + routeFor(file)) errors.push(label + ": canonical must use its own language URL");
    if (canonicals.has(canonical)) errors.push(label + ": duplicate canonical with " + canonicals.get(canonical));
    canonicals.set(canonical, label);
  }

  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(href)) continue;
    const target = localTarget(href);
    if (target && !existsSync(target)) errors.push(label + ": missing local target " + href);
    if (!isNotFoundPage && href.startsWith('/') && !href.startsWith('/assets/') && href !== '/favicon.svg') {
      const currentLocale = localeFor(routeFor(file)).code;
      const destinationLocale = siteLocales.find((locale) => href.startsWith(`/${locale.code}/`))?.code;
      if (!destinationLocale) errors.push(label + ": unlocalized internal link " + href);
      if (destinationLocale && destinationLocale !== currentLocale && href !== localizedPath(destinationLocale, routeFor(file))) errors.push(label + ": language switch must preserve the page " + href);
    }
  }
  if (!isNotFoundPage) {
    if (!siteLocales.some((locale) => routeFor(file).startsWith(`/${locale.code}/`))) errors.push(label + ": unregistered language URL");
    if ((source.match(/data-language-picker/g) || []).length !== 1) errors.push(label + ": expected one standalone language picker");
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

if (!isCheckOnly) {
  const pages = htmlFiles
    .filter((file) => relative(distPath, file).split(sep).join("/") !== "404.html")
    .map(routeFor)
    .sort((a, b) => a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b));

  for (const file of htmlFiles.filter((file) => relative(distPath, file).split(sep).join("/") !== "404.html")) {
    const pagePath = routeFor(file);
    const pageUrl = siteOrigin ? siteOrigin + pagePath : pagePath;
    let source = preparedSources.get(file);
    source = source.replace(/(<link rel="canonical" href=")[^"]+("\s*>)/, (_, before, after) => before + pageUrl + after);
    source = source.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]+"\s*>/g, "");
    const locales = availableLocales(pagePath);
    const alternates = alternatesFor(pagePath);
    source = source.replace(/(<link rel="canonical" href="[^"]+"\s*>)/, "$1" + alternates.map(([language, route]) => `<link rel="alternate" hreflang="${language}" href="${siteOrigin}${route}">`).join(""));
    source = source.replace(/<meta property="og:url"[^>]*>/g, "").replace(/<meta property="og:locale(?::alternate)?"[^>]*>/g, "");
    source = source.replace('</head>', `  <meta property="og:url" content="${pageUrl}"><meta property="og:locale" content="${localeFor(pagePath).ogLocale}">${locales.filter((locale) => locale.code !== localeFor(pagePath).code).map((locale) => `<meta property="og:locale:alternate" content="${locale.ogLocale}">`).join('')}\n</head>`);
    source = source.replace(/"item":"(?:https?:\/\/[^"/]+)?(\/[^"\s]*)"/g, (_, itemPath) => `"item":"${siteOrigin}${itemPath}"`);
    source = source.replace(/"url":"(?:https?:\/\/[^"/]+)?(\/[^"\s]*)"/g, (_, itemPath) => `"url":"${siteOrigin}${itemPath}"`);
    writeFileSync(file, source.replace(/\n(?:[\t ]*\n)+/g, "\n").replace(/[\t ]+\n/g, "\n"));
  }

  const notFound = htmlFiles.find((file) => relative(distPath, file).split(sep).join("/") === "404.html");
  if (notFound) writeFileSync(notFound, preparedSources.get(notFound).replace(/\n(?:[\t ]*\n)+/g, "\n"));

  if (siteOrigin) {
    const urls = pages.map((path) => {
      const alternates = alternatesFor(path);
      return `  <url><loc>${siteOrigin}${path}</loc>${alternates.map(([language, route]) => `<xhtml:link rel="alternate" hreflang="${language}" href="${siteOrigin}${route}"/>`).join('')}</url>`;
    }).join("\n");
    writeFileSync(new URL("sitemap.xml", dist), "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">\n" + urls + "\n</urlset>\n");
    writeFileSync(new URL("robots.txt", dist), "User-agent: *\nAllow: /\n\nSitemap: " + siteOrigin + "/sitemap.xml\n");
    console.log("Validated " + htmlFiles.length + " HTML files and generated sitemap for " + siteOrigin + ".");
  } else {
    const sitemap = new URL("sitemap.xml", dist);
    if (existsSync(sitemap)) rmSync(sitemap);
    writeFileSync(new URL("robots.txt", dist), "User-agent: *\nAllow: /\n");
    console.log("Validated " + htmlFiles.length + " HTML files. Set SITE_ORIGIN during the Cloudflare build to generate an absolute sitemap.");
  }
}
