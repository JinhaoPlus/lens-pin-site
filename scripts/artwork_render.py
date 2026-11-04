"""Shared deterministic transforms for approved store artwork."""
from PIL import Image, ImageOps

def render(image, entry):
    size = (entry['width'], entry['height'])
    if entry.get('layout') == 'contain':
        scaled = ImageOps.contain(image, size, Image.Resampling.LANCZOS)
        canvas = Image.new('RGB', size, '#f4f4ec')
        canvas.paste(scaled, ((size[0]-scaled.width)//2, (size[1]-scaled.height)//2))
        return canvas, [('jpeg', {'quality': 88, 'optimize': True})]
    image = image.resize(size, Image.Resampling.LANCZOS)
    if entry.get('colors'):
        image = image.quantize(colors=entry['colors'])
    return image, [('png', {'optimize': True})] if entry.get('format') == 'png' else [('avif', {'quality': 65}), ('webp', {'quality': 82})]
