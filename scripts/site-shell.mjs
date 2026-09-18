const icon = `<span class="brand-mark" aria-hidden="true"><img src="/favicon.svg" alt=""></span>`;

function current(path, href) {
  if (href === "/support/") return path.startsWith("/support/");
  return path === href;
}

function navLink(path, href, label) {
  const active = current(path, href) ? ` aria-current="page"` : "";
  return `<a href="${href}"${active}>${label}</a>`;
}

export function renderAppStoreBadge(appStoreUrl, appStoreBadgeUrl, extraClass = "") {
  const classes = `app-store-badge-link${extraClass ? ` ${extraClass}` : ""}`;
  return `<a class="${classes}" href="${appStoreUrl}" data-app-store-link data-app-store-badge target="_blank" rel="noopener" aria-label="Download LensPin on the App Store"><img class="app-store-badge-image" src="${appStoreBadgeUrl}" width="250" height="83" alt="Download on the App Store"></a>`;
}

export function renderHeader(path, appStoreUrl) {
  return `<header class="site-header">
    <div class="nav-shell">
      <a class="brand" href="/" aria-label="LensPin home">${icon}<span>LensPin</span></a>
      <nav class="desktop-nav" aria-label="Primary navigation">
        ${navLink(path, "/import-camera-photos-to-iphone/", "Import photos")}
        ${navLink(path, "/add-location-to-photos-iphone/", "Add locations")}
        ${navLink(path, "/how-it-works/", "How it works")}
        ${navLink(path, "/support/", "Support")}
        <a class="button button-primary button-small" href="${appStoreUrl}" data-app-store-link target="_blank" rel="noopener">Get LensPin</a>
      </nav>
      <details class="mobile-nav">
        <summary aria-label="Open navigation"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></summary>
        <nav class="mobile-nav-panel" aria-label="Mobile navigation">
          ${navLink(path, "/import-camera-photos-to-iphone/", "Import photos")}
          ${navLink(path, "/add-location-to-photos-iphone/", "Add locations")}
          ${navLink(path, "/how-it-works/", "How it works")}
          ${navLink(path, "/support/", "Support")}
          <a class="mobile-download" href="${appStoreUrl}" data-app-store-link target="_blank" rel="noopener">Get LensPin</a>
        </nav>
      </details>
    </div>
  </header>`;
}

export function renderFooter(appStoreUrl) {
  const storeLink = `<a class="footer-store-link" href="${appStoreUrl}" data-app-store-link target="_blank" rel="noopener">View LensPin on the App Store →</a>`;
  return `<footer class="site-footer">
    <div class="footer-shell">
      <div class="footer-brand"><a class="brand" href="/">${icon}<span>LensPin</span></a><p>Add locations to camera photos already in Apple Photos—with evidence you can review.</p>${storeLink}</div>
      <div><p class="footer-title">Start here</p><nav class="footer-links"><a href="/import-camera-photos-to-iphone/">Import camera photos</a><a href="/add-location-to-photos-iphone/">Add photo locations</a><a href="/how-it-works/">How LensPin works</a></nav></div>
      <div><p class="footer-title">Methods</p><nav class="footer-links"><a href="/how-to-get-gpx-file/">Get a GPX file</a><a href="/gpx-photo-geotagging-iphone/">With a GPX track</a><a href="/geotag-dslr-photos-with-iphone-photos/">Without GPX</a><a href="/supported-formats/">Formats &amp; limits</a></nav></div>
      <div><p class="footer-title">Help</p><nav class="footer-links"><a href="/support/">Support</a><a href="/privacy/">Privacy</a></nav></div>
    </div>
    <div class="footer-bottom"><span>© <span data-year>2026</span> LensPin.</span><span class="apple-legal">Apple, the Apple logo, App Store, iPhone, and iPad are trademarks of Apple Inc., registered in the U.S. and other countries and regions.</span></div>
  </footer>`;
}
