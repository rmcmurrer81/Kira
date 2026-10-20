#!/usr/bin/env python3
"""Publish Robert's *real* outside-pub video still on About page.

NO GENERATIVE IMAGE, NO Likeness Recreation. Exact original (1.67s of the
10s outdoor take) and background-removed original from Photoshop are used.
The photo and its hair/face pixels are not painted or replaced.
"""
from pathlib import Path
from urllib.request import Request,urlopen
from io import BytesIO
from PIL import Image,ImageOps,ImageDraw,ImageFilter,ImageEnhance
import numpy as np
import re

ROOT=Path("docs");ASSETS=ROOT/"assets"
PUB_STILL="https://at.adobe.com/wlOMSEwnPcGvBH2G"
PUB_CUTOUT="https://photoshop-api.adobe.io/v2/short-url/urn:aaid:ps:US:fd15ddd0-71a0-411b-b79e-8b03dda26268"
def fetch_image(url,title,minimum_width=1600):
    req=Request(url,headers={"User-Agent":"Mozilla/5.0","Accept":"image/png,image/jpeg,image/webp,*/*"})
    with urlopen(req,timeout=130) as r:
        data=r.read(22_000_001);ctype=r.headers.get("Content-Type","")
    if len(data)>22_000_000:raise RuntimeError(f"{title}: too large")
    try:
        img=Image.open(BytesIO(data));img.load()
    except Exception as e:
        raise RuntimeError(f"{title} response is not a usable image: {len(data)} bytes, {ctype}") from e
    if img.width<minimum_width or img.height<850:
        raise RuntimeError(f"{title} unexpected dimensions {img.size}")
    print(title, img.size, img.mode, len(data))
    return img

original=fetch_image(PUB_STILL,"Extracted real pub video still")
cutout=fetch_image(PUB_CUTOUT,"Background-removed pub still").convert("RGBA")
if cutout.size != original.size: raise RuntimeError(f"Cutout coordinates changed: {cutout.size} vs {original.size}")
alpha=cutout.getchannel("A")
abbox=alpha.getbbox()
if abbox is None: raise RuntimeError("Cutout is entirely transparent")
# Adobe must remove the actual pub background. Refuse an image which still has the building.
assert alpha.getpixel((200,440))<35, "Pub background not removed on left"
assert alpha.getpixel((1500,450))<35, "Pub background not removed on right"
assert alpha.getpixel((920,440))>190, "Actual video face is missing"
if not (420 < abbox[0] < 850 and 100 < abbox[1] < 450 and 1100 < abbox[2] < 1700 and 775 < abbox[3] <=1080):
    raise RuntimeError(f"Unexpected subject bounds, refusing to publish {abbox}")
print("Pub cutout subject-only bbox",abbox)

# The user-selected recorded frame itself is saved, not AI reinterpreted.
still_path=ASSETS/"robert-real-pub-outside-still-20261020.webp"
ImageOps.crop(original.convert("RGB"),(0,90,0,240)).save(still_path,"WEBP",quality=94,method=6)

# Composite EXACT subject pixels onto the site's already established city background.
skyline_path=ASSETS/"kira-future-city-hd-20261020.webp"
skyline=Image.open(skyline_path).convert("RGB")
size=(1920,760)
backdrop=ImageOps.fit(skyline,size,method=Image.Resampling.LANCZOS,centering=(.49,.52))
backdrop=ImageEnhance.Brightness(backdrop).enhance(.76).convert("RGBA")

x0=max(0,abbox[0]-22);y0=max(0,abbox[1]-22);x1=min(cutout.width,abbox[2]+22);y1=min(cutout.height,abbox[3]+15)
subject=cutout.crop((x0,y0,x1,y1))
# Only a 1px alpha feather on edges, do not blur the actual face or hair.
a=subject.getchannel("A").filter(ImageFilter.GaussianBlur(.8))
subject.putalpha(a)
scale=min(1.12,685/max(subject.height,1))
subject=subject.resize((round(subject.width*scale),round(subject.height*scale)),Image.Resampling.LANCZOS)
sw,sh=subject.size
# Position on right half. Face looks naturally to camera-left, never at the lens.
px= min(size[0]-sw+32,1090);py=size[1]-sh+17
backdrop.alpha_composite(subject,(px,py))

# Subtle dark gradient on text side, without covering or changing the face.
overlay=Image.new("RGBA",size,(0,0,0,0))
col=ImageDraw.Draw(overlay)
for xx in range(size[0]):
    t=max(0,1-xx/1070)
    opacity=round(215*t**1.65)
    col.line((xx,0,xx,size[1]),fill=(1,10,23,opacity))
out=Image.alpha_composite(backdrop,overlay).convert("RGB")
hero_path=ASSETS/"robert-real-pub-outside-city-20261020.webp"
out.save(hero_path,"WEBP",quality=94,method=6)
for p in [hero_path,still_path]:
    with Image.open(p) as chk:chk.verify()
    if p.stat().st_size<65000:raise RuntimeError(f"Unexpectedly small actual photo {p}")
print("Saved actual video screenshot",still_path.stat().st_size)
print("Saved city composite from original frame",hero_path.stat().st_size)

# Update About hero AND the book gallery card, never leave a mismatched generic AI face.
p=ROOT/"about.html"
h=p.read_text(encoding="utf-8")
old="assets/robert-video-photoalbum-cinematic-20261020.webp"
if old not in h:raise RuntimeError("Expected prior illustration missing: cannot safely update")
h=h.replace(old+"?v=1","assets/"+hero_path.name+"?v=1")
h=h.replace(old,"assets/"+still_path.name)
h=h.replace("AI-assisted cinematic portrait made using Robert’s supplied photo-album video frames as a face reference. Illustrative, not an unedited frame or photograph.","Founder cutout taken from the original 10-second outdoor-pub video at 1.67 seconds; displayed against a separately illustrated city skyline. Facial appearance and hair come from the video frame, not an AI-generated substitute.")
h=h.replace("AI-assisted cinematic portrait based on Robert's photo-album video frames, with city-skyline background; an illustration rather than a documentary photograph","Original frame of Robert outside a pub, looking to the side, with its background removed and replaced by the established city panorama")
h=h.replace("AI-assisted cinematic portrait based on Robert's supplied video frames","Unaltered screenshot from Robert's outdoor-pub video, with natural hair and expression")
h=h.replace("Founder portrait · video-referenced cinematic illustration","Actual pub-video frame · skyline composite")
p.write_text(h,encoding="utf-8")
print("About page actual footage references verified:",h.count(hero_path.name),h.count(still_path.name))
assert h.count(hero_path.name)==2 and h.count(still_path.name)==1 # hero + social card
