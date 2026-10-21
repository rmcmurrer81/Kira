#!/usr/bin/env python3
"""Publish already captured Evelyn compatibility head screenshots; no image generation.

The inputs are host-transfer copies of the three user-provided actual renderer
screenshots. Preserve uncropped JPEG copies and create fixed crops of the canvas,
without retouching the subject. Original artist attribution stays on HTML.
"""
from pathlib import Path
from io import BytesIO
from urllib.request import urlopen,Request
from PIL import Image
import json

ASSETS=Path("docs/assets");ASSETS.mkdir(exist_ok=True,parents=True)
sources={
"front":"https://cdn.openart.ai/openart-uploads/production/attachment-transfers/1ae7435103e7d3a3c9e16d22b72abb21b18286fe45bfbd210698ea8469eb5cc7.jpg",
"three-quarter":"https://cdn.openart.ai/openart-uploads/production/attachment-transfers/7abb46a64baee26f330e3553103758d9076f379c2a22e7ac79b390f8e33b3eed.jpg",
"side":"https://cdn.openart.ai/openart-uploads/production/attachment-transfers/a27da9ec836783d5d608b36af0957ac7a310007075f6c060cea20931ae4cbee9.jpg"
}
for label,url in sources.items():
    request=Request(url,headers={"User-Agent":"Mozilla/5.0","Accept":"image/jpeg,image/png"})
    with urlopen(request,timeout=110) as r:
        original=r.read(3_500_001)
        ct=r.headers.get("Content-Type","")
    if len(original)>3_500_000:raise RuntimeError("Oversize screenshot: "+label)
    img=Image.open(BytesIO(original));img.load()
    if img.size != (1536,1536):raise RuntimeError(f"Unexpected screenshot size {label}: {img.size}")
    if img.mode not in ("RGB","RGBA"):img=img.convert("RGB")
    # The whole host-transfer copy is preserved for inspection of captions.
    raw=ASSETS/f"evelyn-head-{label}-source-20261020.jpg"
    img.convert("RGB").save(raw,"JPEG",quality=94,subsampling=0)
    # The fixed same-size crops show the real capture as it appeared in the canvas,
    # without logos, phone UI, generative processing, or changes to the actual head.
    crop=img.crop((240,315,1060,1145)).convert("RGB")
    # Nonempty-head guard: center of the shot differs strongly from blank backdrop.
    assert crop.getpixel((400,395)) != crop.getpixel((30,30)),label
    target=ASSETS/f"evelyn-head-{label}-capture-20261020.webp"
    crop.save(target,"WEBP",quality=95,method=6)
    with Image.open(target) as check:
        check.verify()
    if target.stat().st_size<14000: raise RuntimeError("Suspiciously small capture "+label)
    print(label,img.size,crop.size,target.stat().st_size,raw.stat().st_size)
print("Three separate angles saved; source snapshots retained; no portrait generated.")
