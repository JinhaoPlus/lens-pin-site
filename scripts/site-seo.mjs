// Shared SEO is generated from each page's visible content, including its FAQ answers.
const decode = (value) => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const plain = (value) => decode(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
const attribute = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const jsonScript = (value) => `<script type="application/ld+json">${JSON.stringify(value).replaceAll('<', '\\u003c')}</script>`;

export function campaignUrl(baseUrl, path) {
  const url = new URL(baseUrl);
  const [language = 'en', ...parts] = path.split('/').filter(Boolean);
  // Keep tokens within the current ASC campaign-name limit (30 characters).
  // https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links
  const aliases = {
    'support_gpx-requirements': 'support_gpx', 'support_location-writeback': 'support_writeback',
    'import-camera-photos-to-iphone': 'import_camera_photos',
    'add-location-to-photos-iphone': 'add_photo_location',
    'gpx-photo-geotagging-iphone': 'gpx_geotagging',
    'geotag-dslr-photos-with-iphone-photos': 'geotag_with_photos',
    'export-gpx-from-garmin-coros-suunto': 'export_watch_gpx',
    'record-gpx-on-iphone-apple-watch': 'record_gpx',
    'add-location-to-camera-photos-apple-photos': 'camera_photo_location',
    'add-location-to-photos-mac': 'photo_location_mac',
    'geotag-photos-gpx-mac': 'gpx_mac',
    'camera-photos-no-location': 'camera_no_location',
    'camera-photos-not-on-apple-photos-map': 'photos_map_fix',
    'photo-location-wrong-or-missing': 'photo_location_fix',
  };
  const topic = parts.join('_') || 'home';
  const slug = aliases[topic] || topic;
  if (`web_${slug}_${language}`.length > 30) throw new Error(`Add a short campaign alias for ${path}`);
  url.searchParams.set('pt', '129459678');
  url.searchParams.set('ct', `web_${slug}_${language}`);
  url.searchParams.set('mt', '8');
  return url.toString();
}

export function prepareSeo(source, path, origin, appStoreUrl) {
  const isHome = /^\/(en|zh)\/$/.test(path);
  const zh = path.startsWith('/zh/');
  const title = plain(source.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'LensPin');
  const description = decode(source.match(/<meta name="description" content="([^"]*)"/)?.[1] || 'LensPin');
  const imageAlt = zh ? 'LensPin 将相机照片匹配到地图上的拍摄地点，商店演示画面' : 'LensPin matching a camera photo to its location on a map; store demonstration';
  const socialImage = `${origin}/assets/lenspin-social-${zh ? 'zh' : 'en'}.jpg`;
  // Recreate these tags to avoid stale home titles and duplicate social metadata.
  source = source.replace(/[\t ]*<meta (?:property="og:(?:title|description|image(?::[^" ]+)?|site_name)"|name="twitter:[^"]+")[^>]*>\s*/g, '');
  const tags = {
    'og:title': title, 'og:description': description, 'og:site_name': 'LensPin',
    'og:image': socialImage, 'og:image:width': '1200',
    'og:image:height': '630', 'og:image:type': 'image/jpeg', 'og:image:alt': imageAlt,
    'twitter:card': 'summary_large_image', 'twitter:title': title,
    'twitter:description': description, 'twitter:image': socialImage,
    'twitter:image:alt': imageAlt,
  };
  source = source.replace('</head>', Object.entries(tags).map(([key, value]) => `  <meta ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${attribute(value)}">`).join('\n') + '\n</head>');
  if (isHome) source = source.replace(/property="og:type" content="[^"]+"/, 'property="og:type" content="website"');

  const graph = [];
  source = source.replace(/[\t ]*<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (_, raw) => {
    const data = JSON.parse(raw);
    const nodes = data['@graph'] || [data];
    for (const node of nodes) {
      if (['FAQPage', 'Organization', 'WebSite'].includes(node['@type'])) continue;
      if (['Article', 'WebPage', 'CollectionPage'].includes(node['@type'])) {
        node.name = title;
        node.description = description;
      }
      if (node['@type'] === 'Article') { node.headline = plain(source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] || title); node.description = description; }
      if (isHome && node['@type'] === 'WebPage') { node.name = title; node.description = description; }
      if (['MobileApplication', 'SoftwareApplication'].includes(node['@type'])) {
        node['@type'] = 'SoftwareApplication';
        node.operatingSystem = ['iOS', 'iPadOS', 'macOS'];
        node.downloadUrl = appStoreUrl;
        node.offers = { '@type': 'Offer', price: 0, priceCurrency: 'USD', description: 'Free download. First 100 successful location additions free. Photos and videos share the allowance; one photo or video saved counts as one use. Optional LensPin Unlimited one-time purchase. Not a subscription. Price as shown on the App Store.' };
        delete node.aggregateRating;
      }
      graph.push(node);
    }
    return '';
  });
  if (isHome) {
    if (!graph.some((node) => node['@type'] === 'WebPage')) graph.unshift({
      '@type': 'WebPage', name: title, description, url: `${origin}${path}`, inLanguage: zh ? 'zh-Hans' : 'en',
    });
    if (!graph.some((node) => node['@type'] === 'BreadcrumbList')) graph.push({
      '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'LensPin', item: `${origin}${path}` }],
    });
    if (!graph.some((node) => node['@type'] === 'SoftwareApplication')) graph.push({
      '@type': 'SoftwareApplication', name: 'LensPin', applicationCategory: 'MultimediaApplication',
      operatingSystem: ['iOS', 'iPadOS', 'macOS'], downloadUrl: appStoreUrl,
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', description: 'Free download. First 100 successful location additions free. Photos and videos share the allowance; one photo or video saved counts as one use. Optional LensPin Unlimited one-time purchase. Not a subscription. Price as shown on the App Store.' },
    });
    const identity = {
      name: 'LensPin', alternateName: ['LensPin: Photo Geotagger', 'LensPin：相机照片补定位'],
      url: `${origin}/`, sameAs: ['https://apps.apple.com/us/app/lenspin-photo-geotagger/id6812626038', 'https://www.reddit.com/r/LensPin/'],
    };
    graph.push({ '@type': 'Organization', '@id': `${origin}/#organization`, ...identity });
    graph.push({ '@type': 'WebSite', '@id': `${origin}/#website`, ...identity, publisher: { '@id': `${origin}/#organization` } });
  }
  for (const node of graph.filter(n => n['@type'] === 'SoftwareApplication')) {
    node.name = 'LensPin: Photo Geotagger';
    node.description = zh
      ? '为 Apple Photos 中缺少位置的相机照片补定位。按拍摄时间匹配同一趟出行用 iPhone 拍的带定位照片、其他带 GPS 的相机拍的照片、GPX 轨迹，或“健康”App 里的体能训练路线。健康路线可在 iPhone 和 iPad 上直接读取，无需导出。审核建议后保存到图库。'
      : 'Add missing locations to camera photos in Apple Photos by matching capture times with geotagged iPhone photos from the same trip, geotagged photos from other GPS-equipped cameras, GPX tracks, or Apple Health workout routes. Read Health workout routes directly on iPhone and iPad without export. Review suggested places before saving.';
    node.featureList = zh ? [
      '参考同一趟出行用 iPhone 拍的带定位照片', '参考其他带 GPS 的相机拍的照片', '使用带时间的 GPX 轨迹',
      '在 iPhone 和 iPad 上从健康直接读取体能训练路线，无需导出',
      '预览相机时钟偏移，不改拍摄时间', '审核地图和参考照片，再保存位置到 Apple Photos',
      '可选导出包含 GPS 的 JPG 副本',
    ] : [
      'Use geotagged iPhone photos from the same trip', 'Use geotagged photos from other GPS-equipped cameras', 'Match photos to timed GPX tracks',
      'Read Apple Health workout routes directly on iPhone and iPad without export',
      'Preview camera clock differences without changing capture dates',
      'Review maps and reference photos before saving locations to Apple Photos',
      'Optionally export JPG copies with GPS',
    ];
    node.screenshot = [
      `${origin}/assets/lenspin-store-mac-01-add-locations-${zh ? 'zh' : 'en'}.webp`,
      `${origin}/assets/lenspin-store-iphone-02-suggestion-evidence-${zh ? 'zh' : 'en'}.webp`,
    ];
  }
  const questions = [...source.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>\s*<div class="faq-answer">([\s\S]*?)<\/div>\s*<\/details>/g)].map(([, question, answer]) => ({
    '@type': 'Question', name: plain(question), acceptedAnswer: { '@type': 'Answer', text: plain(answer) },
  }));
  if (questions.length) graph.push({ '@type': 'FAQPage', inLanguage: zh ? 'zh-Hans' : 'en', mainEntity: questions });
  if (graph.length) source = source.replace('</head>', `  ${jsonScript({ '@context': 'https://schema.org', '@graph': graph })}\n</head>`);
  return source;
}
