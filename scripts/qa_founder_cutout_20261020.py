#!/usr/bin/env python3
"""Review clean founder cutout before replacing the site's current About hero.
Actual user-approved portrait is kept, face never replaced by an invented person.
Writes a QA candidate only. Does not alter the live page until checked."""
from pathlib import Path
from PIL import Image,ImageOps,ImageEnhance,ImageFilter
from rembg import remove,new_session
import numpy as np
import io
root=Path("docs/assets")
out=Path("qa/visual-review")
out.mkdir(parents=True,exist_ok=True)
src=Image.open(root/"robert-mcmurrer-portrait.webp").convert("RGB")
bkg=Image.open(root/"kira-future-city-hd-20261020.webp").convert("RGB")
print("Input",src.size,bkg.size)
session=new_session("u2net")
mask=remove(src,session=session,only_mask=True,post_process_mask=True)
if isinstance(mask,bytes):mask=Image.open(io.BytesIO(mask))
mask=mask.convert("L")
a=np.asarray(mask,dtype=np.uint8)
H,W=a.shape
samples={"face":a[int(H*.32),int(W*.5)].item(),"neck":a[int(H*.46),int(W*.52)].item(),"body":a[int(H*.7),int(W*.55)].item(),"logo":a[int(H*.3),int(W*.09)].item()}
fraction=(a>120).mean()
print("Foreground samples",samples,"foreground fraction",round(float(fraction),4))
if min(samples['face'],samples['neck'],samples['body']) < 170 or not .12 < fraction < .72:
 raise RuntimeError("Cutout would erase Robert; refusing to publish it.")
mask=mask.filter(ImageFilter.GaussianBlur(1.2))
outsize=(1920,690)
background=ImageEnhance.Brightness(ImageOps.fit(bkg,outsize,method=Image.Resampling.LANCZOS)).enhance(.75)
scale=outsize[1]*1.28/src.height
w,h=round(src.width*scale),round(src.height*scale)
subject=src.resize((w,h),Image.Resampling.LANCZOS)
alpha=mask.resize((w,h),Image.Resampling.LANCZOS)
layer=Image.new("RGB",outsize)
alayer=Image.new("L",outsize,0)
x,y=1005,-42
layer.paste(subject,(x,y))
alayer.paste(alpha,(x,y))
composite=Image.composite(layer,background,alayer)
# Conserve full color at the subject; shade only text side.
shadow=Image.new("RGBA",outsize,(1,10,22,0))
overlay=Image.new("RGBA",outsize,(1,10,22,0))
pixels=overlay.load()
for i in range(outsize[0]//2):
 opacity=int(186*(1-i/(outsize[0]*.5))**2)
 for j in range(outsize[1]):pixels[i,j]=(1,10,22,opacity)
composite=Image.alpha_composite(composite.convert("RGBA"),overlay).convert("RGB")
target=out/"robert-founder-cutout-reviewed.webp"
composite.save(target,"WEBP",quality=93,method=6)
mask.save(out/"robert-mask-qa.png")
print("Candidate ready",target,target.stat().st_size)
