// Only the three entry URLs run before static assets; all content stays static.
export function preferredLanguage(header = '') {
  const choices = header.split(',').map((part, order) => {
    const [tag, ...parameters] = part.trim().toLowerCase().split(';');
    const parameter = parameters.map(p => p.trim()).find(p => p.startsWith('q='));
    const quality = parameter === undefined ? 1 : Number(parameter.slice(2));
    return { tag, quality, order };
  }).filter(({ tag, quality }) => /^(en|zh)(-|$)/.test(tag) && Number.isFinite(quality) && quality > 0 && quality <= 1)
    .sort((a, b) => b.quality - a.quality || a.order - b.order);
  return choices[0]?.tag.startsWith('zh') ? 'zh' : 'en';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      url.pathname = `/${preferredLanguage(request.headers.get('Accept-Language') || '')}/`;
      return new Response(null, { status: 302, headers: {
        Location: url.href, Vary: 'Accept-Language', 'Cache-Control': 'private, no-store',
      } });
    }
    if (url.pathname === '/en' || url.pathname === '/zh') {
      url.pathname += '/';
      return new Response(null, { status: 301, headers: { Location: url.href } });
    }
    return env.ASSETS.fetch(request);
  },
};
