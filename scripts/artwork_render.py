"""Shared deterministic transforms for approved store artwork."""
import hashlib
import io
import os
from pathlib import Path
import subprocess
from PIL import Image, ImageOps


def load_source(root, entry):
    source = root / entry['source']
    assert hashlib.sha256(source.read_bytes()).hexdigest() == entry['source_sha256'], source
    if entry.get('layout') != 'hero-transparent':
        return Image.open(source).convert('RGB')
    # The approved PNG is opaque. Its editable SVG preserves white photo frames,
    # phone screens and shadows without the damage caused by color-keying pixels.
    svg = root / entry['editable_source']
    assert hashlib.sha256(svg.read_bytes()).hexdigest() == entry['editable_source_sha256'], svg
    markup = svg.read_text()
    backdrop = '<rect width="1920" height="1080" fill="url(#bg)"/>'
    halo = '<ellipse cx="960" cy="620" rx="960" ry="650" fill="url(#halo)"/>'
    assert markup.count(backdrop) == markup.count(halo) == 1
    markup = markup.replace(backdrop, '').replace(halo, '')
    # Reuse the source-material toolchain read-only; never write into that folder.
    sharp = os.environ.get('SHARP_MODULE', str(Path(__file__).resolve().parents[2] / 'appstore_materials/lenspin-template-studio/node_modules/sharp'))
    output = subprocess.run(['node', '-e',
        "const sharp=require(process.argv[1]); const fs=require('fs'); sharp(fs.readFileSync(0)).resize(+process.argv[2],+process.argv[3]).png().toBuffer().then(b=>process.stdout.write(b)).catch(e=>{console.error(e);process.exit(1)});",
        sharp, str(entry['width']), str(entry['height'])], input=markup.encode(), capture_output=True, check=True)
    return Image.open(io.BytesIO(output.stdout)).convert('RGBA')

def render(image, entry):
    size = (entry['width'], entry['height'])
    if entry.get('layout') == 'social-full-bleed':
        scaled = ImageOps.contain(image, size, Image.Resampling.LANCZOS)
        # The approved Mac artwork fills the height. Extend its background at
        # either edge rather than adding contrasting beige letterbox strips.
        assert scaled.height == size[1]
        # Remove the tiny FOR MAC label using the adjacent plain blue column.
        # The subtitle already identifies the platform; keep the headline and
        # the screenshot at their original contained scale.
        x1, y1, x2, y2 = entry['remove_tag_box']
        scaled.paste(scaled.crop((x2, y1, x2+1, y2)).resize((x2-x1, y2-y1)), (x1, y1))
        inset = (size[0]-scaled.width)//2
        canvas = Image.new('RGB', size)
        canvas.paste(scaled.crop((0, 0, 1, scaled.height)).resize((inset, size[1])), (0, 0))
        canvas.paste(scaled, (inset, 0))
        right = inset + scaled.width
        canvas.paste(scaled.crop((scaled.width-1, 0, scaled.width, scaled.height)).resize((size[0]-right, size[1])), (right, 0))
        return canvas, [('jpeg', {'quality': 88, 'optimize': True})]
    image = image.resize(size, Image.Resampling.LANCZOS)
    if entry.get('colors'):
        image = image.quantize(colors=entry['colors'])
    return image, [('png', {'optimize': True})] if entry.get('format') == 'png' else [('avif', {'quality': 65}), ('webp', {'quality': 82})]
