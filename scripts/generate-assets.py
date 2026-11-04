#!/usr/bin/env python3
"""Generate optimized local assets for the Maruf Billah portfolio.

The profile images are a direct conversion of the user-provided photograph —
the face is never generated or altered. Project covers are intentionally
abstract concept previews, not screenshots and not evidence of completed work.
All artwork uses the luxury light palette: #F7F6F2 / #EFEEE8 / #B18A50.
"""

from __future__ import annotations

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE_PHOTO = PUBLIC / "images" / "maruf-billah-original.jpg"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_SERIF_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

PAPER = (247, 246, 242)
SAND = (239, 238, 232)
PURE = (255, 255, 255)
INK = (23, 23, 23)
MUTED = (119, 117, 111)
GOLD = (177, 138, 80)
BRONZE = (138, 106, 59)
LINE = (229, 226, 218)
OLIVE = (95, 122, 95)
SLATE = (74, 110, 138)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)


def font_serif(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_SERIF_BOLD, size)


def flatten_light(image: Image.Image, background: tuple[int, int, int] = PAPER) -> Image.Image:
    """Composite translucent drawing correctly before saving to a non-alpha format."""
    base = Image.new("RGBA", image.size, (*background, 255))
    base.alpha_composite(image)
    return base.convert("RGB")


def vertical_gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    w, h = size
    image = Image.new("RGB", size, top)
    draw = ImageDraw.Draw(image, "RGBA")
    for y in range(h):
        t = y / max(1, h - 1)
        color = tuple(round(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        draw.line((0, y, w, y), fill=color)
    return image


def glow(image: Image.Image, box: tuple[int, int, int, int], color: tuple[int, int, int], alpha: int = 60, radius: int = 100) -> None:
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse(box, fill=(*color, alpha))
    image.alpha_composite(layer.filter(ImageFilter.GaussianBlur(radius)))


def draw_grid(draw: ImageDraw.ImageDraw, size: tuple[int, int], spacing: int = 44, alpha: int = 12, color: tuple[int, int, int] = INK) -> None:
    w, h = size
    for x in range(0, w, spacing):
        draw.line((x, 0, x, h), fill=(*color, alpha), width=1)
    for y in range(0, h, spacing):
        draw.line((0, y, w, y), fill=(*color, alpha), width=1)


def panel(draw: ImageDraw.ImageDraw, box, radius: int, fill, outline=None, width: int = 1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def make_profile_images() -> None:
    source = ImageOps.exif_transpose(Image.open(SOURCE_PHOTO)).convert("RGB")
    for filename, edge in (("maruf-billah.webp", 1200), ("maruf-billah-640.webp", 640)):
        optimized = source.resize((edge, edge), Image.Resampling.LANCZOS)
        optimized.save(PUBLIC / "images" / filename, "WEBP", quality=88, method=6)
    print("Generated optimized profile WebP images from the provided photograph.")


def base_cover(title: str, subtitle: str, accent: tuple[int, int, int]) -> Image.Image:
    w, h = 1600, 1000
    image = vertical_gradient((w, h), (250, 249, 245), SAND).convert("RGBA")
    glow(image, (-220, -300, 720, 480), GOLD, 52, 130)
    glow(image, (980, 540, 1780, 1240), accent, 38, 140)
    grid = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw_grid(ImageDraw.Draw(grid, "RGBA"), (w, h), 46, 10)
    image.alpha_composite(grid)

    draw = ImageDraw.Draw(image, "RGBA")
    panel(draw, (64, 62, w - 64, h - 62), 6, (*PURE, 205), (*INK, 34), 2)
    draw.text((124, 124), "MARUF.B  /  PROJECT CONCEPT", font=font(23, True), fill=(*BRONZE, 255))
    draw.text((122, 182), title, font=font_serif(62), fill=(*INK, 255))
    draw.text((126, 276), subtitle, font=font(25), fill=(*MUTED, 255))
    draw.line((126, 324, 300, 324), fill=(*GOLD, 255), width=3)

    # Explicit concept badge — these are not screenshots of working products.
    panel(draw, (w - 452, 118, w - 124, 182), 4, (*GOLD, 32), (*GOLD, 200), 2)
    draw.text((w - 420, 139), "CONCEPT PREVIEW", font=font(22, True), fill=(*BRONZE, 255))

    # Abstract application window in the light developer workspace.
    window = (126, 366, w - 126, h - 118)
    panel(draw, window, 5, (*PURE, 235), (*INK, 42), 2)
    draw.line((126, 434, w - 126, 434), fill=(*INK, 28), width=2)
    for i, color in enumerate(((201, 188, 165), (214, 201, 174), (183, 168, 136))):
        x = 166 + i * 34
        draw.ellipse((x, 394, x + 16, 410), fill=(*color, 255))
    panel(draw, (310, 384, w - 300, 418), 4, (*SAND, 255))
    return image


def make_niketan_cover() -> None:
    image = base_cover("NIKETAN MART", "E-commerce / Food Superstore  •  Storefront concept", OLIVE)
    draw = ImageDraw.Draw(image, "RGBA")
    panel(draw, (170, 478, 420, 852), 4, (*SAND, 255), (*INK, 24))
    for i in range(6):
        y = 516 + i * 54
        panel(draw, (200, y, 386, y + 28), 3, (*GOLD, 150 if i == 0 else 46))
    for row in range(2):
        for col in range(4):
            x = 458 + col * 252
            y = 486 + row * 205
            panel(draw, (x, y, x + 220, y + 176), 4, (*PURE, 255), (*INK, 28))
            draw.rounded_rectangle((x + 18, y + 18, x + 202, y + 104), radius=3, fill=(*OLIVE, 40 + (row + col) * 8))
            draw.rounded_rectangle((x + 18, y + 122, x + 150, y + 140), radius=2, fill=(*INK, 70))
            draw.rounded_rectangle((x + 18, y + 150, x + 92, y + 164), radius=2, fill=(*GOLD, 190))
    flatten_light(image).save(PUBLIC / "projects" / "niketan-mart.webp", "WEBP", quality=88, method=6)


def make_inbox_cover() -> None:
    image = base_cover("AI OMNICHANNEL INBOX", "AI SaaS  •  Unified conversation workspace concept", SLATE)
    draw = ImageDraw.Draw(image, "RGBA")
    panel(draw, (170, 478, 330, 852), 4, (*SAND, 255), (*INK, 24))
    for i in range(5):
        draw.ellipse((216, 516 + i * 66, 264, 564 + i * 66), fill=(*GOLD, 60 + i * 22))
    panel(draw, (360, 478, 720, 852), 4, (*PURE, 245), (*INK, 26))
    for i in range(6):
        y = 510 + i * 56
        draw.ellipse((388, y, 424, y + 36), fill=(*BRONZE, 28 + i * 8))
        draw.rounded_rectangle((442, y + 4, 670 - i * 12, y + 18), radius=2, fill=(*INK, 58))
        draw.rounded_rectangle((442, y + 24, 610 - i * 10, y + 34), radius=2, fill=(*INK, 26))
    panel(draw, (754, 478, 1430, 852), 4, (*PURE, 245), (*INK, 30))
    bubbles = [
        (800, 526, 1120, 606, (*SAND, 255)),
        (1040, 636, 1382, 720, (*GOLD, 70)),
        (800, 746, 1190, 824, (*BRONZE, 42)),
    ]
    for box in bubbles:
        draw.rounded_rectangle(box[:4], radius=4, fill=box[4])
        for j in range(2):
            y = box[1] + 25 + j * 24
            draw.rounded_rectangle((box[0] + 24, y, box[2] - 40 - j * 36, y + 10), radius=2, fill=(*INK, 95))
    flatten_light(image).save(PUBLIC / "projects" / "ai-omnichannel-inbox.webp", "WEBP", quality=88, method=6)


def make_voice_cover() -> None:
    image = base_cover("WINDOWS AI VOICE AGENT", "AI Desktop Application  •  Voice workflow concept", GOLD)
    draw = ImageDraw.Draw(image, "RGBA")
    panel(draw, (170, 806, 1430, 856), 4, (*SAND, 255), (*INK, 24))
    panel(draw, (360, 476, 1240, 786), 4, (*PURE, 250), (*INK, 34), 2)
    draw.text((410, 516), "VOICE WORKSPACE", font=font(23, True), fill=(*BRONZE, 255))
    panel(draw, (410, 566, 1190, 706), 3, (*SAND, 255), (*INK, 22))
    center_y = 636
    for x in range(440, 1160, 8):
        amplitude = 12 + 38 * abs(math.sin((x - 440) / 72))
        jitter = 8 * abs(math.sin((x - 440) / 21))
        height = amplitude + jitter
        color = (*BRONZE, 220) if x < 800 else (*GOLD, 220)
        draw.rounded_rectangle((x, center_y - height / 2, x + 4, center_y + height / 2), radius=2, fill=color)
    for i in range(3):
        x = 430 + i * 260
        panel(draw, (x, 726, x + 220, 766), 3, (*SAND, 255), (*INK, 20))
    flatten_light(image).save(PUBLIC / "projects" / "windows-ai-voice-agent.webp", "WEBP", quality=88, method=6)


def make_og_image() -> None:
    w, h = 1200, 630
    image = vertical_gradient((w, h), (250, 249, 245), SAND).convert("RGBA")
    glow(image, (-220, -260, 640, 500), GOLD, 44)
    glow(image, (720, 260, 1400, 900), GOLD, 30)
    grid = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw_grid(ImageDraw.Draw(grid, "RGBA"), (w, h), 48, 10)
    image.alpha_composite(grid)

    # Exact, unaltered photograph — only a professional crop and soft edge blend.
    photo = ImageOps.exif_transpose(Image.open(SOURCE_PHOTO)).convert("RGB")
    photo = ImageOps.fit(photo, (500, 630), method=Image.Resampling.LANCZOS, centering=(0.5, 0.42))
    photo_mask = Image.new("L", (500, 630), 0)
    mask_draw = ImageDraw.Draw(photo_mask)
    mask_draw.rectangle((0, 0, 500, 630), fill=255)
    for x in range(120):
        mask_draw.line((x, 0, x, 630), fill=round(255 * (x / 120)))
    image.paste(photo, (700, 0), photo_mask)

    draw = ImageDraw.Draw(image, "RGBA")
    draw.rectangle((46, 46, 1154, 584), outline=(*INK, 40), width=2)
    draw.rectangle((46, 46, 52, 584), fill=(*GOLD, 255))
    draw.text((102, 106), "MARUF.B  /  PORTFOLIO", font=font(26, True), fill=(*BRONZE, 255))
    draw.text((98, 176), "MARUF", font=font_serif(90), fill=(*INK, 255))
    draw.text((98, 282), "BILLAH", font=font_serif(90), fill=(*GOLD, 255))
    draw.line((104, 402, 260, 402), fill=(*GOLD, 255), width=3)
    draw.text((102, 430), "WEB DEVELOPER", font=font(29, True), fill=(*INK, 255))
    draw.text((102, 480), "BANGLADESH", font=font(21), fill=(*MUTED, 255))
    draw.text((102, 528), "BUILDING DIGITAL EXPERIENCES WITH CODE & CREATIVITY", font=font(15, True), fill=(*BRONZE, 255))
    flatten_light(image).save(PUBLIC / "og-image.png", "PNG", optimize=True)


def main() -> None:
    make_profile_images()
    make_niketan_cover()
    make_inbox_cover()
    make_voice_cover()
    make_og_image()
    print("Generated 3 light concept-preview covers and the luxury light Open Graph image.")


if __name__ == "__main__":
    main()
