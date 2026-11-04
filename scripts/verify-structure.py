"""Keep demo/callout labels out of the document outline."""
from html.parser import HTMLParser
from pathlib import Path

class Outline(HTMLParser):
    def __init__(self):
        super().__init__(); self.stack=[]; self.h1=0
    def handle_starttag(self, tag, attrs):
        classes=dict(attrs).get('class','').split()
        if tag in ('h1','h2','h3','h4','h5','h6'):
            if tag=='h1': self.h1+=1
            forbidden={'page-hero-visual','app-icon-card','answer-box','callout','task-result','result-card','demo-label'}
            assert not any(forbidden.intersection(c) for _,c in self.stack), f'{self.file}: {tag} inside demo/callout'
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
            self.stack.append((tag,classes))
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i][0]==tag:
                del self.stack[i:]; break

pages=list(Path(__file__).resolve().parent.parent.joinpath('dist').rglob('*.html'))
for p in pages:
    outline=Outline();outline.file=p;outline.feed(p.read_text());assert outline.h1==1,(p,outline.h1)
print(f'Verified {len(pages)} outlines: one H1 each and no headings inside demos/callouts.')
