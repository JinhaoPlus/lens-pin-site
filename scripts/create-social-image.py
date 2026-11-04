"""Rebuild the 1200 x 630 social card using the site's existing photo and icon.
Requires Pillow: python3 scripts/create-social-image.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

assets = Path(__file__).resolve().parent.parent / 'dist' / 'assets'
canvas = Image.new('RGB', (1200, 630), '#f4f4f1')
photo = ImageOps.fit(Image.open(assets / 'coastal-journey.jpg').convert('RGB'), (430, 630), centering=(0.55, 0.5))
canvas.paste(photo, (770, 0))
icon = Image.open(assets / 'lenspin-app-icon.png').convert('RGBA').resize((88, 88), Image.Resampling.LANCZOS)
canvas.paste(icon, (64, 62), icon)
draw = ImageDraw.Draw(canvas)
def font(size, bold=False):
    return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial' + (' Bold' if bold else '') + '.ttf', size)
draw.text((172, 76), 'LensPin', font=font(58, True), fill='#17212d')
draw.text((64, 214), 'Add location to', font=font(54, True), fill='#17212d')
draw.text((64, 282), 'camera photos.', font=font(54, True), fill='#17212d')
draw.text((64, 386), 'iPhone  ·  iPad  ·  Mac', font=font(32), fill='#0a5ce0')
draw.text((64, 524), 'getlenspin.com', font=font(25), fill='#505158')
canvas.save(assets / 'lenspin-social.png', optimize=True)
