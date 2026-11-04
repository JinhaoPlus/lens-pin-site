"""Shared deterministic transforms for approved store artwork."""
from PIL import Image, ImageOps

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
