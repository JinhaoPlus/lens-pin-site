"""Resize the approved store exports listed in Docs/artwork-task3.json and Docs/artwork-task4.json.

Requires Pillow with AVIF support. No source artwork is changed.
Usage: python3 scripts/create-store-artwork.py [--source /path/to/02_最新导出]
"""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageOps

repo = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, default=repo.parent / 'appstore_materials' / 'LensPin_商店素材_统一交付_2026-10-23' / '02_最新导出')
parser.add_argument('--social-only', action='store_true')
args = parser.parse_args()
assets = repo / 'dist/assets'
entries = []
for manifest in ['artwork-task3.json', 'artwork-task4.json']:
    entries.extend(json.loads((repo / 'Docs' / manifest).read_text()))
for entry in entries:
    social = entry['asset'] == 'lenspin-social'
    if args.social_only and not social:
        continue
    image = Image.open(args.source / entry['source']).convert('RGB')
    size = (entry['width'], entry['height'])
    if entry.get('format') == 'png':
        image.resize(size, Image.Resampling.LANCZOS).save(assets / (entry['asset'] + '.png'), optimize=True)
    elif social:
        image = ImageOps.contain(image, size, Image.Resampling.LANCZOS)
        canvas = Image.new('RGB', size, '#080d17')
        canvas.paste(image, ((size[0] - image.width) // 2, (size[1] - image.height) // 2))
        canvas.save(assets / 'lenspin-social.png', optimize=True)
    else:
        image = image.resize(size, Image.Resampling.LANCZOS)
        image.save(assets / (entry['asset'] + '.avif'), quality=65)
        image.save(assets / (entry['asset'] + '.webp'), quality=82)
