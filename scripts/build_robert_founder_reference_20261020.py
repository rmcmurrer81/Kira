#!/usr/bin/env python3
"""Replace the failed blank skyline and office logos with Robert's approved likeness.
This is an actual website media asset, not a flattened website mockup.
Draws a safe, explicitly defined hair/shoulder mask, rather than allowing
automatic segmentation to erase the person again.
"""
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance, ImageDraw, ImageFilter, ImageChops
import math
assets=Path("docs/assets")
portrait=Image.open(assets/"robert-mcmurrer-portrait.webp").convert("RGB")
city=Image.open(assets/"kira-future-city-hd-20261020.webp").convert("RGB")
sw,sh=portrait.size
print("Source image dimensions",sw,sh)
# Coordinates normalized to the original 1000x1370 founder photo,
# following the outside of the hair and shoulders, NOT an oval over the face.
outline=[
 (432,112),(490,102),(556,107),(612,109),(667,126),(721,148),
 (765,184),(788,239),(804,304),(795,365),(783,435),(761,510),
 (753,557),(775,598),(828,625),(887,660),(945,715),(996,780),
 (1015,850),(1015,1400),(-20,1400),(-20,825),(47,758),
 (120,708),(200,656),(269,630),(325,582),(339,530),(317,485),
 (308,435),(300,364),(301,303),(310,239),(331,192),(370,142)
]
poly=[(round(x*sw/1000),round(y*sh/1370)) for x,y in outline]
mask=Image.new("L",portrait.size,0)
ImageDraw.Draw(mask).polygon(poly,fill=255)
# 12px feather is substantial but keeps hairstyle/face recognizable.
mask=mask.filter(ImageFilter.GaussianBlur(11*sw/1000))
# The skyline is the clean, separately generated, already published image.
outsize=(1920,690)
background=ImageOps.fit(city,outsize,method=Image.Resampling.LANCZOS,centering=(.50,.52))
background=ImageEnhance.Brightness(background).enhance(.78)
# Match reference concept: founder is to the RIGHT; leave unbroken negative space for HTML text on LEFT.
scale=(outsize[1]*1.35)/sh
ww,hh=round(sw*scale),round(sh*scale)
subject=portrait.resize((ww,hh),Image.Resampling.LANCZOS)
alpha=mask.resize((ww,hh),Image.Resampling.LANCZOS)
# Face appears about x=1320, the same right-side placement as the design reference.
px,py=1000,-42
overlay=Image.new("RGB",outsize)
overlay.paste(subject,(px,py))
over_alpha=Image.new("L",outsize,0)
over_alpha.paste(alpha,(px,py))
composite=Image.composite(overlay,background,over_alpha)
# Apply a black/navy readability gradient only on the text half of the photograph.
shade=Image.new("RGBA",outsize,(0,0,0,0))
sp=shade.load()
for x in range(outsize[0]):
    t=min(1,max(0,x/(outsize[0]*.52)))
    a=int(205*(1-t)**2)
    for y in range(outsize[1]):
        sp[x,y]=(1,10,23,a)
composite=Image.alpha_composite(composite.convert("RGBA"),shade).convert("RGB")
target=assets/"robert-founder-skyline-real-likeness-20261020.webp"
composite.save(target,"WEBP",quality=91,method=6)
with Image.open(target) as test: test.verify()
print("Saved verified portrait with founder face",target,target.stat().st_size)
