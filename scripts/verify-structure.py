"""Keep demo/callout labels out of the document outline."""
from html.parser import HTMLParser
from pathlib import Path
import re

# GPX names are checked only inside samples; a normal page <time> is valid HTML.
GPX_ELEMENTS = set('gpx metadata bounds trk trkseg trkpt rte rtept wpt time ele '
                   'name desc cmt src link type number extensions speed course '
                   'fix sat hdop vdop pdop ageofdgpsdata dgpsid magvar geoidheight '
                   'author copyright keywords year license email text'.split())
CJK = re.compile(r'[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\U00020000-\U000323af]')

class Outline(HTMLParser):
    def __init__(self):
        super().__init__(); self.stack=[]; self.h1=0
    def handle_starttag(self, tag, attrs):
        self.check_sample_tag(tag)
        classes=dict(attrs).get('class','').split()
        if tag in ('h1','h2','h3','h4','h5','h6'):
            if tag=='h1': self.h1+=1
            forbidden={'page-hero-visual','app-icon-card','answer-box','callout','task-result','result-card','demo-label'}
            assert not any(forbidden.intersection(c) for _,c in self.stack), f'{self.file}: {tag} inside demo/callout'
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
            self.stack.append((tag,classes))
    def handle_endtag(self, tag):
        self.check_sample_tag(tag)
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i][0]==tag:
                del self.stack[i:]; break

    def check_sample_tag(self, tag):
        if any(t in ('pre', 'code') for t, _ in self.stack):
            assert tag.split(':')[-1] not in GPX_ELEMENTS, f'{self.file}: raw <{tag}> in code/pre; escape XML with &lt; and &gt;'

    def handle_data(self, data):
        if '/en/' not in self.file.as_posix(): return
        if not any(t == 'body' for t, _ in self.stack): return
        if any(t in ('script', 'style', 'template') or {'language-picker', 'home-language-switch'}.intersection(c) for t, c in self.stack): return
        # The Chinese App Store name may intentionally appear in English copy.
        text = data.replace('LensPin：相机照片补定位', '')
        assert not CJK.search(text), f'{self.file}: CJK in English visible text: {data.strip()!r}'

pages=list(Path(__file__).resolve().parent.parent.joinpath('dist').rglob('*.html'))
for p in pages:
    outline=Outline();outline.file=p;outline.feed(p.read_text());assert outline.h1==1,(p,outline.h1)
print(f'Verified {len(pages)} outlines: one H1 each, no headings inside demos/callouts, escaped GPX samples, and no unexpected CJK in English visible text.')
