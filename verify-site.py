from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

root = Path(__file__).parent / 'dist'
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.anchors=[]; self.assets=[]; self.sections=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag=='section': self.sections.append(a.get('id'))
        if tag=='a' and a.get('href','').startswith('#'): self.anchors.append(a['href'][1:])
        value=a.get('src') or (a.get('href') if tag=='link' else None)
        if value and not urlsplit(value).scheme: self.assets.append(urlsplit(value).path)
page=Page(); page.feed((root/'index.html').read_text(encoding='utf-8'))
assert page.sections==['quien','fuentes','tendencias','oportunidades','futuro'], page.sections
assert len(page.ids)==len(set(page.ids)), 'Duplicate element identifiers'
assert all(target in page.ids for target in page.anchors), 'Broken chapter/scene/source link'
assert all((root/asset).is_file() for asset in page.assets), 'Missing runtime asset'
assert len([i for i in page.ids if i.startswith('source-')])==8
assert all(f'trend-{i}' in page.ids and f'opportunity-{i}' in page.ids for i in range(1,6))
print('PASS: five chapters, 8 sources, 5 trend/opportunity pairs, unique IDs and valid local anchors/assets.')
