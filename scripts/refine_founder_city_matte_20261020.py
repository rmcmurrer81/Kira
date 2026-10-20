#!/usr/bin/env python3
"""Give the previously published founder city composite a clean subject cutout."""
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance, ImageFilter
from rembg import remove, new_session
import numpy as np
import cv2

assets=Path("docs/assets")
source=Image.open(assets/"about-turned-video-portrait.webp").convert("RGB")
backdrop=Image.open(assets/"kira-future-city-hd-20261020.webp").convert("RGB")
print("Portrait source",source.size,"skyline",backdrop.size)
session=new_session("u2net")
mask=remove(source,session=session,only_mask=True,post_process_mask=True)
if not isinstance(mask,Image.Image):
    from io import BytesIO
    mask=Image.open(BytesIO(mask))
mask=mask.convert("L")
print("Matte generated at",mask.size)
matte=np.asarray(mask)
# Remove detached components in the subject matte (e.g. background light bulbs).
n, labels, stats, _ = cv2.connectedComponentsWithStats((matte > 100).astype("uint8"),8)
if n>1:
    largest=1+int(np.argmax(stats[1:,cv2.CC_STAT_AREA]))
    clean=(labels==largest).astype("uint8")*255
    clean=cv2.dilate(clean,np.ones((21,21),np.uint8),iterations=1)
    matte=(matte*clean/255).astype("uint8")
mask=Image.fromarray(matte,"L").filter(ImageFilter.GaussianBlur(1.6))
target=(1920,1080)
# The founder remains a photographic 3/4-profile figure on the right.
front=ImageOps.fit(source,target,method=Image.Resampling.LANCZOS,centering=(.56,.5))
alpha=ImageOps.fit(mask,target,method=Image.Resampling.LANCZOS,centering=(.56,.5))
city=ImageOps.fit(backdrop,target,method=Image.Resampling.LANCZOS,centering=(.60,.49))
city=ImageEnhance.Brightness(city).enhance(.67)
city=city.filter(ImageFilter.GaussianBlur(1.3))
out=Image.composite(front,city,alpha)
path=assets/"robert-cinematic-waterfront-20261020.webp"
out.save(path,format="WEBP",quality=94,method=6)
print("Final photo composite",path,path.stat().st_size)
