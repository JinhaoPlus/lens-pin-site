// Contact copy is shared by the visible pages and their generated FAQ schema.
export function prepareContact(source, path, appStoreUrl) {
  const match = path.match(/^\/(en|zh)\/(support\/|privacy\/)?$/);
  if (!match) return source;
  const [, lang, topic = ''] = match;
  const zh = lang === 'zh';
  const storeLink = text => `<a href="${appStoreUrl}" data-app-store-link target="_blank" rel="noopener">${text}</a>`;
  const communityLink = text => `<a href="https://www.reddit.com/r/LensPin/" target="_blank" rel="noopener">${text}</a>`;
  if (topic !== 'privacy/') {
    const question = zh ? '如何联系 LensPin？' : 'How do I contact LensPin?';
    const answer = zh
      ? `请使用 ${storeLink('App Store 产品页面')}上的支持联系方式。也可以在 Reddit 的 ${communityLink('LensPin 社区')}提问。`
      : `Use the support contact on the ${storeLink('LensPin App Store page')}. You can also ask in the ${communityLink('LensPin community on Reddit')}.`;
    const faq = `<details><summary>${question}</summary><div class="faq-answer"><p>${answer}</p></div></details>`;
    const existing = new RegExp(`<details><summary>${question.replace('?', '\\?')}</summary>[\\s\\S]*?</details>`, 'g');
    source = source.replace(existing, '');
    source = source.replace(/(<div class="faq-list">[\s\S]*?)(<\/div>\s*(?:<p>|<\/section>))/, `$1${faq}$2`);
  }
  if (topic === 'support/') {
    const heading = zh ? '联系 LensPin' : 'Contact LensPin';
    const body = zh
      ? `前往 ${communityLink('LensPin 社区')}求助，或使用 ${storeLink('App Store 页面')}上的支持联系方式。`
      : `Ask in the ${communityLink('LensPin community')} or use the support contact on the ${storeLink('App Store page')}.`;
    const section = `<section class="content-section" id="contact"><div class="prose"><h2>${heading}</h2><p>${body}</p></div></section>`;
    source = source.replace(/<section class="content-section" id="contact">[\s\S]*?<\/section>/g, '');
    source = source.replace('</main>', `${section}</main>`);
  }
  if (topic === 'privacy/') {
    const heading = zh ? '政策更新' : 'Policy updates';
    const body = zh
      ? `实质性隐私变化会更新本页及日期。产品问题可先查<a href="/zh/support/">支持页</a>，或使用 ${storeLink('App Store 产品页面')}显示的支持联系方式。`
      : `Material privacy changes will be reflected on this page with a new review date. For product questions, start with the <a href="/en/support/">LensPin support page</a> or use the support contact shown on the ${storeLink('App Store listing')}.`;
    source = source.replace(new RegExp(`(<h2>${heading}</h2>)<p>[\\s\\S]*?</p>`), `$1<p>${body}</p>`);
  }
  return source;
}
