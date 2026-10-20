#!/usr/bin/env python3
"""Make a controlled, feathered photo composite that always retains Robert's portrait."""
from PIL import Image, ImageOps, ImageDraw, ImageEnhance, ImageFilter
from pathlib import Path
import math

assets=Path("docs/assets")
source=Image.open(assets/"about-turned-video-portrait.webp").convert("RGB")
city=Image.open(assets/"kira-future-city-hd-20261020.webp").convert("RGB")
w,h=source.size
print("Source dimensions",source.size,city.size)
# Traced outline of the profile and jacket in the supplied movie frame.
# Keeps the person; unlike model segmentation, cannot erase him.
reference=[
 (1010,0),(1420,0),(1530,12),(1620,80),(1705,185),
 (1755,310),(1760,430),(1715,520),(1690,645),(1640,765),
 (1635,820),(1700,910),(1930,980),(2220,1080),(390,1080),
 (565,982),(700,900),(835,820),(870,735),(880,600),
 (850,480),(855,350),(880,228),(895,155),(960,72)
]
sx,sy=w/2400,h/1080
poly=[(round(x*sx),round(y*sy)) for x,y in reference]
mask=Image.new("L",(w,h),0)
d=ImageDraw.Draw(mask)
d.polygon(poly,fill=255)
# A tight but soft edge: the cutout should melt into the city lights.
mask=mask.filter(ImageFilter.GaussianBlur(radius=11))
target=(1920,1080)
portrait=ImageOps.fit(source,target,method=Image.Resampling.LANCZOS,centering=(.56,.5))
alpha=ImageOps.fit(mask,target,method=Image.Resampling.LANCZOS,centering=(.56,.5))
background=ImageOps.fit(city,target,method=Image.Resampling.LANCZOS,centering=(.60,.49))
background=ImageEnhance.Brightness(background).enhance(.65)
# Person remains foreground-sharp, and the night waterfront is entirely behind him.
picture=Image.composite(portrait,background,alpha)
p=assets/"robert-cinematic-waterfront-20261020.webp"
picture.save(p,format="WEBP",quality=93,method=6)
print("Updated",p,p.stat().st_size)
