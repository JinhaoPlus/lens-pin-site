import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const dist = new URL("../dist/", import.meta.url);
const distPath = dist.pathname;
const siteOrigin = (process.env.SITE_ORIGIN || "").replace(/\/+$/, "");
const isCheckOnly = process.argv.includes("--check");
const errors = [];

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const htmlFiles = walk(distPath).filter((file) => file.endsWith(".html"));
const titles = new Map();
const canonicals = new Map();

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

for (const file of htmlFiles) {
  const source = readFileSync(file, "utf8");
  const label = relative(distPath, file).split(sep).join("/");
  const title = source.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
  const description = source.match(/<meta name="description" content="([^"]+)">/)?.[1]?.trim();
  const h1Count = (source.match(/<h1(?:\s|>)/g) || []).length;
  const canonical = source.match(/<link rel="canonical" href="([^"]+)">/)?.[1]?.trim();
  const isNotFoundPage = label === "404.html";

  if (!title) errors.push(label + ": missing title");
  if (!description) errors.push(label + ": missing meta description");
  if (h1Count !== 1) errors.push(label + ": expected one h1, found " + h1Count);
  if (!/<html lang="en">/.test(source)) errors.push(label + ": expected html lang=en");
  if (!/<meta name="viewport"/.test(source)) errors.push(label + ": missing viewport meta tag");
  if (!canonical && !isNotFoundPage) errors.push(label + ": missing canonical");
  if (!isNotFoundPage && !/<meta property="og:type"/.test(source)) errors.push(label + ": missing og:type");
  if (!isNotFoundPage && !/<meta property="og:title"/.test(source)) errors.push(label + ": missing og:title");
  if (!isNotFoundPage && !/<meta property="og:description"/.test(source)) errors.push(label + ": missing og:description");
  if (!isNotFoundPage && !/<script type="application\/ld\+json">/.test(source)) errors.push(label + ": missing JSON-LD");
  if (title && title.replace(/&amp;/g, "&").length > 65) errors.push(label + ": title is longer than 65 characters");
  if (description && description.length > 160) errors.push(label + ": meta description is longer than 160 characters");

  for (const image of source.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="[^"]*"/.test(image[0])) errors.push(label + ": image is missing alt text");
  }

  if (title && !isNotFoundPage) {
    if (titles.has(title)) errors.push(label + ": duplicate title with " + titles.get(title));
    titles.set(title, label);
  }
  if (canonical) {
    if (canonicals.has(canonical)) errors.push(label + ": duplicate canonical with " + canonicals.get(canonical));
    canonicals.set(canonical, label);
  }

  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(href)) continue;
    const target = localTarget(href);
    if (target && !existsSync(target)) errors.push(label + ": missing local target " + href);
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
    let source = readFileSync(file, "utf8");
    source = source.replace(/(<link rel="canonical" href=")[^"]+("\s*>)/, (_, before, after) => before + pageUrl + after);
    source = source.replace(/(<link rel="alternate" hreflang="(?:en|x-default)" href=")[^"]+("\s*>)/g, (_, before, after) => before + pageUrl + after);
    source = source.replace(/"item":"(?:https?:\/\/[^"/]+)?(\/[^"\s]*)"/g, (_, itemPath) => `"item":"${siteOrigin}${itemPath}"`);
    writeFileSync(file, source);
  }

  if (siteOrigin) {
    const urls = pages.map((path) => "  <url><loc>" + siteOrigin + path + "</loc><lastmod>2026-09-17</lastmod></url>").join("\n");
    writeFileSync(new URL("sitemap.xml", dist), "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" + urls + "\n</urlset>\n");
    writeFileSync(new URL("robots.txt", dist), "User-agent: *\nAllow: /\n\nSitemap: " + siteOrigin + "/sitemap.xml\n");
    console.log("Validated " + htmlFiles.length + " HTML files and generated sitemap for " + siteOrigin + ".");
  } else {
    const sitemap = new URL("sitemap.xml", dist);
    if (existsSync(sitemap)) rmSync(sitemap);
    writeFileSync(new URL("robots.txt", dist), "User-agent: *\nAllow: /\n");
    console.log("Validated " + htmlFiles.length + " HTML files. Set SITE_ORIGIN during the Cloudflare build to generate an absolute sitemap.");
  }
}
