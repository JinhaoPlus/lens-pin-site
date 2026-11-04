// Public LensPin listing, verified against Apple's US and China storefronts.
// A production build refuses to ship while the placeholder ID is still present.
export const siteConfig = {
  siteOrigin: "https://getlenspin.com",
  appStoreUrl: "https://apps.apple.com/app/id6812626038?pt=129459678&ct=web_home_en&mt=8",
  macAppStoreUrl: "https://apps.apple.com/app/id6812626038?pt=129459678&ct=website_mac&mt=12",
  // Official Apple artwork, kept unmodified.
  // Source: https://toolbox.marketingtools.apple.com/api/badges/download-on-the-mac-app-store/black/{en-us,zh-cn}?size=250x83
  macAppStoreBadgeUrl: "/assets/download-on-the-mac-app-store.svg",
  macAppStoreBadgeZhUrl: "/assets/download-on-the-mac-app-store-zh.svg",
  appStorePlaceholderId: "0000000000",
  // Unmodified official Apple artwork, served locally to avoid external redirects.
  // Source: https://toolbox.marketingtools.apple.com/api/badges/download-on-the-app-store/black/en-us?size=250x83
  appStoreBadgeUrl: "/assets/download-on-the-app-store.svg",
  // Source: https://toolbox.marketingtools.apple.com/api/badges/download-on-the-app-store/black/zh-cn?size=250x83
  appStoreBadgeZhUrl: "/assets/download-on-the-app-store-zh.svg"
};
