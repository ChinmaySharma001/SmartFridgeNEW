from PIL import Image, ImageDraw, ImageFont
import os

out_dir = os.path.join(os.path.dirname(__file__), "..", "synthetic", "imgs")
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, "test.jpg")

img = Image.new("RGB", (640, 160), color=(255,255,255))
draw = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype("arial.ttf", 36)
except Exception:
    font = ImageFont.load_default()
draw.text((20, 50), "Test 123\nDate: 2025-11-20", fill=(0,0,0), font=font)
img.save(out_path, quality=95)
print("Wrote:", out_path)