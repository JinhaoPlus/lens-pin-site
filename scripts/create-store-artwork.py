"""Resize the approved store exports listed in Docs/artwork-task3.json and Docs/artwork-task4.json.

Requires Pillow with AVIF support. Transparent heroes also use the source studio's
read-only sharp installation (override with SHARP_MODULE). No source artwork is changed.
Usage: python3 scripts/create-store-artwork.py [--source /path/to/02_最新导出]
"""
import argparse
import json
from pathlib import Path
from PIL import Image
from artwork_render import render, load_source

repo = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, default=repo.parent / 'appstore_materials' / 'LensPin_商店素材_统一交付_2026-10-23' / '02_最新导出')
parser.add_argument('--social-only', action='store_true')
args = parser.parse_args()
assets = repo / 'dist/assets'
entries = []
for manifest in ['artwork-task3.json', 'artwork-task4.json', 'artwork-task6.json']:
    entries.extend(json.loads((repo / 'Docs' / manifest).read_text()))
for entry in entries:
    social = entry['asset'].startswith('lenspin-social-')
    if args.social_only and not social:
        continue
    image = load_source(args.source, entry)
    image, formats = render(image, entry)
    for ext, options in formats:
        suffix = 'jpg' if ext == 'jpeg' else ext
        image.save(assets / (entry['asset'] + '.' + suffix), format=ext, **options)
