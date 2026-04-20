# scripts/generate_synthetic.py
import os, random
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np

OUT_DIR = "synthetic/imgs"
os.makedirs(OUT_DIR, exist_ok=True)

EXPIRY_PHRASES = [
    "EXP: {d}/{m}/{y}",
    "Use Before: {d}-{m}-{y}",
    "Best Before: {m}/{y}",
    "Expires On {d} {mon} {y}",
    "MFG: {d}/{m}/{y}",
    "Best before {months} months from MFD",
    "Use within {days} days of opening"
]

MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

def rnd_date():
    d = random.randint(1,28)
    m = random.randint(1,12)
    y = random.randint(2024,2030)
    return d, m, y

def random_font():
    # pick a font from fonts/ or default
    fonts = ["fonts/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    for f in fonts:
        if os.path.exists(f):
            return f
    return None

def distort_image(img_cv):
    # blur sometimes
    if random.random() < 0.4:
        k = random.choice([(3,3), (5,5)])
        img_cv = cv2.GaussianBlur(img_cv, k, 0)
    # noise
    if random.random() < 0.35:
        noise = np.random.randint(0,40,img_cv.shape, dtype='uint8')
        img_cv = cv2.add(img_cv, noise)
    # contrast / brightness
    if random.random() < 0.3:
        alpha = random.uniform(0.8,1.3)
        beta = random.randint(-20,20)
        img_cv = cv2.convertScaleAbs(img_cv, alpha=alpha, beta=beta)
    # warp (simulate curved/uneven surface)
    if random.random() < 0.3:
        h, w = img_cv.shape[:2]
        pts1 = np.float32([[0,0],[w,0],[0,h],[w,h]])
        delta = 10
        pts2 = pts1 + np.random.uniform(-delta, delta, pts1.shape).astype(np.float32)
        M = cv2.getPerspectiveTransform(pts1, pts2)
        img_cv = cv2.warpPerspective(img_cv, M, (w,h))
    # rotate small angle
    angle = random.uniform(-8, 8)
    M2 = cv2.getRotationMatrix2D((img_cv.shape[1]//2,img_cv.shape[0]//2), angle, 1)
    img_cv = cv2.warpAffine(img_cv, M2, (img_cv.shape[1], img_cv.shape[0]), borderMode=cv2.BORDER_REPLICATE)
    return img_cv

def generate(idx):
    d,m,y = rnd_date()
    months = random.randint(6,24)
    days = random.randint(1,30)
    phrase = random.choice(EXPIRY_PHRASES).format(d=d, m=m, y=y, mon=random.choice(MONTHS), months=months, days=days)
    # create base image
    W, H = random.choice([(400,200),(600,240),(500,220)])
    bg = (random.randint(230,255),)*3 if random.random()<0.8 else (random.randint(0,30),)*3
    img = Image.new("RGB",(W,H),color=bg)
    draw = ImageDraw.Draw(img)
    font_path = random_font()
    font_size = random.randint(18,40)
    if font_path:
        font = ImageFont.truetype(font_path, font_size)
    else:
        font = ImageFont.load_default()
    # random position
    x = random.randint(10, max(10, W-250))
    y0 = random.randint(20, max(20, H-60))
    draw.text((x,y0), phrase, fill=(0,0,0), font=font)
    # add secondary small lines sometimes
    if random.random() < 0.4:
        draw.text((x, y0+font_size+6), f"Batch: {random.choice(['A12','B34','X9'])}", fill=(0,0,0), font=font)
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    img_cv = distort_image(img_cv)
    fname = f"{OUT_DIR}/synthetic_{idx:04d}.jpg"
    cv2.imwrite(fname, img_cv)
    return fname, phrase

if __name__ == "__main__":
    N = 600
    meta = []
    for i in range(N):
        fp, phrase = generate(i)
        meta.append((fp, phrase))
    print("Generated", len(meta), "images in", OUT_DIR)
