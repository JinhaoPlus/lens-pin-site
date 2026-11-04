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
  const imageAlt = 'LensPin: add location to camera photos on iPhone, iPad and Mac, with a coastal camera photo and the LensPin app icon';
  // Recreate these tags to avoid stale home titles and duplicate social metadata.
  source = source.replace(/[\t ]*<meta (?:property="og:(?:title|description|image(?::[^" ]+)?|site_name)"|name="twitter:[^"]+")[^>]*>\s*/g, '');
  const tags = {
    'og:title': title, 'og:description': description, 'og:site_name': 'LensPin',
    'og:image': `${origin}/assets/lenspin-social.png`, 'og:image:width': '1200',
    'og:image:height': '630', 'og:image:type': 'image/png', 'og:image:alt': imageAlt,
    'twitter:card': 'summary_large_image', 'twitter:title': title,
    'twitter:description': description, 'twitter:image': `${origin}/assets/lenspin-social.png`,
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
      if (isHome && node['@type'] === 'WebPage') { node.name = title; node.description = description; }
      if (['MobileApplication', 'SoftwareApplication'].includes(node['@type'])) {
        node['@type'] = 'SoftwareApplication';
        node.operatingSystem = ['iOS 17+', 'iPadOS 17+', 'macOS 14+'];
        node.downloadUrl = appStoreUrl;
        node.offers = { '@type': 'Offer', price: 0, priceCurrency: 'USD', description: 'Free download. First 100 successful location additions free; optional LensPin Unlimited one-time in-app purchase (US $3.99 / CN ¥12). Not a subscription.' };
        delete node.aggregateRating;
      }
      graph.push(node);
    }
    return '';
  });
  if (isHome) {
    if (!graph.some((node) => node['@type'] === 'SoftwareApplication')) graph.push({
      '@type': 'SoftwareApplication', name: 'LensPin', applicationCategory: 'MultimediaApplication',
      operatingSystem: ['iOS 17+', 'iPadOS 17+', 'macOS 14+'], downloadUrl: appStoreUrl,
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', description: 'Free download. First 100 successful location additions free; optional LensPin Unlimited one-time in-app purchase (US $3.99 / CN ¥12). Not a subscription.' },
    });
    const identity = {
      name: 'LensPin', alternateName: ['LensPin: Photo Geotagger', 'LensPin：相机照片补定位'],
      url: `${origin}/`, sameAs: ['https://apps.apple.com/us/app/lenspin-photo-geotagger/id6812626038', 'https://www.reddit.com/r/LensPin/'],
    };
    graph.push({ '@type': 'Organization', '@id': `${origin}/#organization`, ...identity });
    graph.push({ '@type': 'WebSite', '@id': `${origin}/#website`, ...identity, publisher: { '@id': `${origin}/#organization` } });
  }
  const questions = [...source.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>\s*<div class="faq-answer">([\s\S]*?)<\/div>\s*<\/details>/g)].map(([, question, answer]) => ({
    '@type': 'Question', name: plain(question), acceptedAnswer: { '@type': 'Answer', text: plain(answer) },
  }));
  if (questions.length) graph.push({ '@type': 'FAQPage', inLanguage: zh ? 'zh-Hans' : 'en', mainEntity: questions });
  if (graph.length) source = source.replace('</head>', `  ${jsonScript({ '@context': 'https://schema.org', '@graph': graph })}\n</head>`);
  return source;
}
