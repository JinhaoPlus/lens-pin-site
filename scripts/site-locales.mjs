import { siteConfig } from './site-config.mjs';

// Register a language only when its homepage and shared navigation are ready.
// Per-page availability is checked at build time; unpublished translations stay hidden.
export const defaultLanguage = 'en';
export const siteLocales = [
  {
    code: 'en', htmlLang: 'en', nativeName: 'English', shortName: 'EN', ogLocale: 'en_US',
    badgeUrl: siteConfig.appStoreBadgeUrl,
    ui: {
      home: 'LensPin home', navigation: 'Primary navigation', mobileNavigation: 'Mobile navigation',
      openNavigation: 'Open navigation', closeNavigation: 'Close navigation',
      chooseLanguage: 'Choose language', languages: 'Available languages', currentLanguage: 'Current language',
      importPhotos: 'Import photos', addLocations: 'Add locations', howItWorks: 'How it works', support: 'Support',
      download: 'Get LensPin', badgeLabel: 'Download LensPin on the App Store', badgeAlt: 'Download on the App Store',
      description: 'Add locations to camera photos already in Apple Photos—with evidence you can review.',
      storeLink: 'View LensPin on the App Store →', startHere: 'Start here', importGuide: 'Import camera photos',
      locationGuide: 'Add photo locations', workflowGuide: 'How LensPin works', methods: 'Methods',
      getGpx: 'Get a GPX file', withGpx: 'With a GPX track', withoutGpx: 'Without GPX', formats: 'Formats &amp; limits',
      help: 'Help', feedback: 'User feedback', privacy: 'Privacy',
      appleLegal: 'Apple, the Apple logo, App Store, iPhone, and iPad are trademarks of Apple Inc., registered in the U.S. and other countries and regions.',
    },
  },
  {
    code: 'zh', htmlLang: 'zh-Hans', nativeName: '简体中文', shortName: '中文', ogLocale: 'zh_CN',
    badgeUrl: siteConfig.appStoreBadgeZhUrl,
    ui: {
      home: 'LensPin 首页', navigation: '主导航', mobileNavigation: '移动端导航',
      openNavigation: '打开导航', closeNavigation: '关闭导航',
      chooseLanguage: '选择语言', languages: '可用语言', currentLanguage: '当前语言',
      importPhotos: '导入照片', addLocations: '补位置教程', howItWorks: '工作原理', support: '帮助',
      download: '下载 LensPin', badgeLabel: '在 App Store 下载 LensPin', badgeAlt: '在 App Store 下载',
      description: '给已在 Apple Photos 中的相机照片补位置，查看依据后再确认保存。',
      storeLink: '在 App Store 查看 LensPin →', startHere: '开始使用', importGuide: '导入相机照片',
      locationGuide: '给照片补位置', workflowGuide: 'LensPin 工作原理', methods: '匹配方法',
      getGpx: '获取 GPX 文件', withGpx: '用 GPX 轨迹匹配', withoutGpx: '没录 GPX 的方法', formats: '支持范围与限制',
      help: '帮助', feedback: '真实用户反馈', privacy: '隐私政策',
      appleLegal: 'Apple、App Store、iPhone 和 iPad 是 Apple Inc. 的商标。',
    },
  },
];

export function localeFor(path) {
  return siteLocales.find((locale) => path.startsWith(`/${locale.code}/`))
    || siteLocales.find((locale) => locale.code === defaultLanguage);
}
export function languageFor(path) { return localeFor(path).code; }
export function contentPath(path) {
  const locale = siteLocales.find((candidate) => path.startsWith(`/${candidate.code}/`));
  return locale ? path.slice(locale.code.length + 1) : path;
}
export function localizedPath(language, path) { return `/${language}${contentPath(path)}`; }
