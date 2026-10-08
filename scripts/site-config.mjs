// Public LensPin listing, verified against Apple's US and China storefronts.
// A production build refuses to ship while the placeholder ID is still present.
export const siteConfig = {
  siteOrigin: "https://getlenspin.com",
  appStoreUrl: "https://apps.apple.com/app/id6812626038",
  appStorePlaceholderId: "0000000000",
  // Unmodified official Apple artwork, served locally to avoid external redirects.
  // Source: https://toolbox.marketingtools.apple.com/api/badges/download-on-the-app-store/black/en-us?size=250x83
  appStoreBadgeUrl: "/assets/download-on-the-app-store.svg"
};
