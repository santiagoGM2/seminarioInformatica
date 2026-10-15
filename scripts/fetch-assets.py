"""Download the editorial portraits from the verified public profiles."""
from pathlib import Path
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
import json

root = Path(__file__).resolve().parents[1]
portraits = {
    'midudev': 'https://avatars.githubusercontent.com/u/1561955?v=4',
    'andrew-ng': 'https://home-wordpress.deeplearning.ai/wp-content/uploads/2020/12/headshot-andrew-ng.jpg',
    'dotcsv': 'https://yt3.googleusercontent.com/wqWZ8SXmktP5ROcvTxW2lGXskpwd2rZkthLaau8pZhJapVXOdLHLNvPkVnuy3waAp-nd7zwddQ=s900-c-k-c0x00ffffff-no-rj',
    'mouredev': 'https://avatars.githubusercontent.com/u/17043402?v=4',
    'fazt': 'https://avatars.githubusercontent.com/u/13667358?v=4',
    'statquest': 'https://yt3.googleusercontent.com/Lzc9YzCKTkcA1My5A5pbsqaEtOoGc0ncWpCJiOQs2-0win3Tjf5XxmDFEYUiVM9jOTuhMjGs=s900-c-k-c0x00ffffff-no-rj',
}
def fetch(item):
    name, url = item
    with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=40) as response:
        assert response.headers.get_content_type().startswith('image/'), name
        (root / 'dist/assets' / f'{name}.jpg').write_bytes(response.read())
    return name
with ThreadPoolExecutor(max_workers=4) as pool:
    print('Portraits:', ', '.join(pool.map(fetch, portraits.items())))
(root / 'ASSETS.json').write_text(json.dumps({
    'santiago-gomez.png': {'origin': 'User supplied profile photo, 2026-10-15', 'processing': 'Unmodified original'},
    **{f'{name}.jpg': {'origin': url, 'purpose': 'Editorial identification with link to official channel', 'verified': '2026-10-15'} for name, url in portraits.items()},
    'trend-*.svg': {'origin': 'Original vectors authored for this website', 'processing': 'No external raster sources'},
}, ensure_ascii=False, indent=2), encoding='utf-8')
