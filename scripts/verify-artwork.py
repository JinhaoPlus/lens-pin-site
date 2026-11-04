"""Audit all built image references and store-artwork provenance; write Docs/task4-image-audit.json."""
import hashlib
import io
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from PIL import Image, ImageOps

repo = Path(__file__).resolve().parent.parent
dist = repo / 'dist'
root = repo.parent / 'appstore_materials/LensPin_商店素材_统一交付_2026-10-23/02_最新导出'
entries = sum([json.loads((repo / 'Docs' / f'artwork-task{n}.json').read_text()) for n in (3, 4)], [])
provenance = {}
for entry in entries:
    source = root / entry['source']
    assert hashlib.sha256(source.read_bytes()).hexdigest() == entry['source_sha256'], source
    im = Image.open(source).convert('RGB')
    size = (entry['width'], entry['height'])
    if entry['asset'] == 'lenspin-social':
        scaled = ImageOps.contain(im, size, Image.Resampling.LANCZOS)
        im = Image.new('RGB', size, '#080d17')
        im.paste(scaled, ((size[0]-scaled.width)//2, (size[1]-scaled.height)//2))
        formats = [('png', {'optimize': True})]
    else:
        im = im.resize(size, Image.Resampling.LANCZOS)
        formats = [('png', {'optimize': True})] if entry.get('format') == 'png' else [('avif', {'quality': 65}), ('webp', {'quality': 82})]
    for ext, options in formats:
        path = '/assets/' + entry['asset'] + '.' + ext
        output = dist / path.lstrip('/')
        expected = io.BytesIO()
        im.save(expected, format=ext, **options)
        assert expected.getvalue() == output.read_bytes(), f'Output differs from declared source: {path}'
        provenance[path] = entry

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs, self.links, self.ids, self.images = [], [], set(), []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.add(a['id'])
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
        if tag in ('img', 'source'):
            if tag == 'img': self.images.append(a)
            for attr in ('src', 'srcset'):
                for candidate in a.get(attr, '').split(','):
                    if candidate.strip(): self.refs.append({'tag': tag, 'attribute': attr, 'src': candidate.strip().split()[0]})

pages = {}
for p in sorted(dist.rglob('*.html')):
    page = Page(); page.feed(p.read_text()); pages[p] = page
rows, used, links = [], set(), 0
badges = {'/assets/download-on-the-app-store.svg', '/assets/download-on-the-app-store-zh.svg'}
for p, page in pages.items():
    route = '/' + p.relative_to(dist).as_posix().removesuffix('index.html')
    for ref in page.refs:
        src = ref['src']; parsed = urlsplit(src)
        assert not parsed.scheme and src.startswith('/'), (p,src)
        target = dist / unquote(parsed.path).lstrip('/')
        assert target.is_file(), (p, src)
        used.add(parsed.path)
        entry = provenance.get(parsed.path)
        assert entry or parsed.path in badges, f'Unapproved artwork: {p} {src}'
        if entry and entry['asset'].startswith('lenspin-store'):
            lang = 'zh' if route.startswith('/zh/') else 'en'
            assert entry['asset'].endswith('-'+lang), (p,src)
        rows.append({'page':route, **ref, 'exists':True, 'source':entry['source'] if entry else 'Official Apple App Store badge (exception)', 'source_sha256':entry['source_sha256'] if entry else None})
    for img in page.images:
        assert 'alt' in img and 'width' in img and 'height' in img, (p,img)
        if 'lenspin-store-' in img['src']:
            entry = provenance[img['src']]
            assert img['alt'].strip() and int(img['width'])==entry['width'] and int(img['height'])==entry['height'], (p,img)
            assert img.get('loading') in ('eager','lazy'), (p,img)
    for href in page.links:
        url = urlsplit(href)
        if url.scheme or url.netloc: continue
        target = dist / unquote(url.path).lstrip('/') if url.path.startswith('/') else p.parent / unquote(url.path)
        if not url.path: target=p
        if target.is_dir(): target=target/'index.html'
        assert target.is_file(), (p,href)
        if url.fragment: assert unquote(url.fragment) in pages[target].ids, (p,href)
        links += 1
    # All non-utility content pages now have real localized product artwork.
    if p.name!='404.html' and '/privacy/' not in route:
        assert any('lenspin-store-' in i['src'] for i in page.images), f'No product image: {route}'
# Include metadata/CSS/JS references when deciding whether an image is unused.
text = '\n'.join(p.read_text() for p in dist.rglob('*') if p.is_file() and p.suffix in ('.html','.css','.js','.svg','.xml','.txt'))
unused = [str(p.relative_to(dist)) for p in (dist/'assets').iterdir() if p.suffix in ('.png','.jpg','.avif','.webp','.svg') and '/assets/'+p.name not in text]
assert not unused, unused
report = {'html_pages':len(pages),'internal_links_checked':links,'image_references':len(rows),'unique_img_source_files':len(used),'provenance_outputs_verified':len(provenance),'missing_images':[],'unused_images':unused,'references':rows}
(repo/'Docs/task4-image-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='references'},indent=2))
