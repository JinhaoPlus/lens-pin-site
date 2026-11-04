import { siteConfig } from './site-config.mjs';
import { localeFor, localizedPath, siteLocales } from './site-locales.mjs';
export { contentPath, languageFor, localizedPath } from './site-locales.mjs';

const icon = `<span class="brand-mark" aria-hidden="true"><img src="/assets/lenspin-app-icon.png" width="64" height="64" alt=""></span>`;
const globe = `<svg class="language-globe" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z" stroke="currentColor" stroke-width="1.6"/></svg>`;
const chevron = `<svg class="language-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function navLink(path, href, label) {
  const active = path === href || (href.endsWith('/support/') && path.startsWith(href));
  return `<a href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
}

export function renderAppStoreBadge(appStoreUrl, appStoreBadgeUrl, extraClass = '') {
  return `<a class="app-store-badge-link${extraClass ? ` ${extraClass}` : ''}" href="${appStoreUrl}" data-app-store-link data-app-store-badge target="_blank" rel="noopener" aria-label="Download LensPin on the App Store"><img class="app-store-badge-image" src="${appStoreBadgeUrl}" width="250" height="83" alt="Download on the App Store"></a>`;
}

export function renderLanguagePicker(path, availableLocales = siteLocales) {
  const current = localeFor(path), { ui } = current;
  const options = availableLocales.map((locale) => {
    const selected = locale.code === current.code;
    return `<a class="language-option" href="${localizedPath(locale.code, path)}" lang="${locale.htmlLang}" hreflang="${locale.htmlLang}"${selected ? ' aria-current="true"' : ''}><span>${locale.nativeName}</span>${selected ? `<span class="language-check" aria-hidden="true">✓</span><span class="visually-hidden">${ui.currentLanguage}</span>` : ''}</a>`;
  }).join('\n');
  return `<details class="language-picker" data-language-picker><summary aria-label="${ui.chooseLanguage}: ${current.nativeName}">${globe}<span class="language-name">${current.nativeName}</span><span class="language-short" aria-hidden="true">${current.shortName}</span>${chevron}</summary><nav class="language-options" aria-label="${ui.languages}">${options}</nav></details>`;
}

export function renderHeader(path, appStoreUrl, availableLocales = siteLocales) {
  const { code, ui } = localeFor(path);
  const local = (route) => localizedPath(code, route);
  const links = [
    ['/how-it-works/', ui.howItWorks],
    ['/#pricing', ui.pricing],
    ['/guides/', ui.guides],
    ['/support/', ui.support],
  ].map(([route, label]) => navLink(path, local(route), label)).join('\n        ');
  return `<header class="site-header"><div class="nav-shell">
    <a class="brand" href="${local('/')}" aria-label="${ui.home}">${icon}<span>LensPin</span></a>
    <nav class="desktop-nav" aria-label="${ui.navigation}">${links}</nav>
    <div class="header-actions">
      ${/^\/(en|zh)\/$/.test(path) ? `<a class="home-language-switch" href="/${code === 'en' ? 'zh' : 'en'}/" lang="${code === 'en' ? 'zh-Hans' : 'en'}" hreflang="${code === 'en' ? 'zh-Hans' : 'en'}">${globe}${code === 'en' ? '中文' : 'English'}</a>` : renderLanguagePicker(path, availableLocales)}
      <a class="button button-primary button-small header-download" href="${appStoreUrl}" data-app-store-link target="_blank" rel="noopener">${ui.download}</a>
      <details class="mobile-nav"><summary aria-label="${ui.openNavigation}" data-open-label="${ui.openNavigation}" data-close-label="${ui.closeNavigation}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></summary><nav class="mobile-nav-panel" aria-label="${ui.mobileNavigation}">${links}<a class="mobile-download" href="${appStoreUrl}" data-app-store-link target="_blank" rel="noopener">${ui.download}</a></nav></details>
    </div>
  </div></header>`;
}

export function renderFooter(appStoreUrl, path = '/en/') {
  const { code, ui } = localeFor(path);
  const local = (route) => localizedPath(code, route);
  const groups = [
    [ui.startHere, [
      ['/guides/', ui.guides],
      ['/import-camera-photos-to-iphone/', ui.importGuide],
      ['/add-location-to-photos-iphone/', ui.locationGuide],
      ['/how-it-works/', ui.workflowGuide],
    ]],
    [ui.methods, [
      ['/how-to-get-gpx-file/', ui.getGpx],
      ['/gpx-photo-geotagging-iphone/', ui.withGpx],
      ['/geotag-dslr-photos-with-iphone-photos/', ui.withoutGpx],
      ['/supported-formats/', ui.formats],
    ]],
    [ui.help, [
      ['/user-feedback/', ui.feedback],
      ['/support/', ui.support],
      ['/privacy/', ui.privacy],
    ]],
  ];
  return `<footer class="site-footer"><div class="footer-shell">
    <div class="footer-brand"><a class="brand" href="${local('/')}">${icon}<span>LensPin</span></a><p>${ui.description}</p><a class="footer-store-link" href="${appStoreUrl}" data-app-store-link target="_blank" rel="noopener">${ui.storeLink}</a></div>
    ${groups.map(([title, links]) => `<div><p class="footer-title">${title}</p><nav class="footer-links">${links.map(([route, label]) => `<a href="${local(route)}">${label}</a>`).join('')}</nav></div>`).join('\n')}
    </div><div class="footer-bottom"><span>© <span data-year>2026</span> LensPin.</span><span class="apple-legal">${ui.appleLegal}</span></div></footer>`;
}

export function renderDownloadBadges(appStoreUrl, path) {
  const locale = localeFor(path), zh = locale.code === 'zh';
  const macAlt = zh ? '在 Mac App Store 下载' : 'Download on the Mac App Store';
  const macLabel = zh ? '在 Mac App Store 下载 LensPin' : 'Download LensPin on the Mac App Store';
  const appBadge = renderAppStoreBadge(appStoreUrl, locale.badgeUrl)
    .replace('Download LensPin on the App Store', locale.ui.badgeLabel)
    .replace('alt="Download on the App Store"', `alt="${locale.ui.badgeAlt}"`);
  return `<div class="download-badges">${appBadge}<a class="app-store-badge-link mac-app-store-badge-link" href="${siteConfig.macAppStoreUrl}" data-mac-app-store-link data-mac-app-store-badge target="_blank" rel="noopener" aria-label="${macLabel}"><img class="mac-app-store-badge-image" src="${zh ? siteConfig.macAppStoreBadgeZhUrl : siteConfig.macAppStoreBadgeUrl}" width="${zh ? 140.18325 : 156.10054}" height="40" alt="${macAlt}"></a></div>`;
}
