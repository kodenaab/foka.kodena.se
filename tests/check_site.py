from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

root = Path('site')
class Links(HTMLParser):
    def __init__(self, path):
        super().__init__(); self.path = path; self.ids = set(); self.fragments = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            value = attrs.get(key, '')
            url = urlsplit(value)
            if url.scheme or url.netloc: continue
            if url.path:
                target = self.path.parent / unquote(url.path)
                assert target.is_file(), (self.path, target)
            elif url.fragment: self.fragments.append(url.fragment)
for path in root.glob('*.html'):
    source = path.read_text()
    assert 'chatgpt.com' not in source and 'libfile_' not in source
    parser = Links(path); parser.feed(source)
    assert all(f in parser.ids for f in parser.fragments), path
print('PASS static links, assets, page anchors and absence of private download links')
