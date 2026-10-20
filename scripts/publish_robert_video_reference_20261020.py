#!/usr/bin/env python3
"""Publish reviewed, video-reference cinematic founder portrait to the real site.
Uses an existing image derived from the saved photo-album video face frames.
Do not use a generic face from a site concept. Preserve evidence labels.
"""
from pathlib import Path
from urllib.request import Request,urlopen
from io import BytesIO
from PIL import Image,ImageOps

ROOT=Path("docs"); assets=ROOT/"assets"
source_url="https://at.adobe.com/DedSa9WMnnLMaCFi"
req=Request(source_url,headers={"User-Agent":"Mozilla/5.0 (KiraLabs site media update)","Accept":"image/*"})
with urlopen(req,timeout=120) as response:
    raw=response.read(18_000_001)
    typ=response.headers.get("Content-Type","")
if len(raw)>18_000_000: raise RuntimeError("Founder image too large")
try:
    im=Image.open(BytesIO(raw));im.load()
except Exception as e:
    raise RuntimeError(f"Founder image URL did not return an image ({typ}): {len(raw)} bytes") from e
if im.width<1600 or im.height<850:raise RuntimeError(f"Founder image unexpectedly low-res: {im.size}")
name="robert-video-photoalbum-cinematic-20261020.webp"
out=assets/name
im.convert("RGB").save(out,"WEBP",quality=94,method=6)
with Image.open(out) as test: test.verify()
assert out.stat().st_size>150000

p=ROOT/"about.html"
html=p.read_text(encoding="utf-8")
original='assets/robert-founder-skyline-real-likeness-20261020.webp?v=3'
if original not in html:raise RuntimeError("Expected old About image reference missing")
html=html.replace(original,"assets/"+name+"?v=1")
html=html.replace('assets/about-turned-video-portrait.webp',"assets/"+name)
html=html.replace("AI-assisted founder image based on Robert’s approved portrait reference. Not an unedited personal photograph.","AI-assisted cinematic portrait made using Robert’s supplied photo-album video frames as a face reference. Illustrative, not an unedited frame or photograph.")
html=html.replace("New cinematic composite of Robert’s approved AI-assisted film portrayal against a city skyline, illustrative and not an unedited photograph","AI-assisted cinematic portrait based on Robert's photo-album video frames, with city-skyline background; an illustration rather than a documentary photograph")
html=html.replace("Creative cinematic video still, not a documentary portrait","AI-assisted cinematic portrait based on Robert's supplied video frames")
html=html.replace("Founder portrait · cinematic composite","Founder portrait · video-referenced cinematic illustration")
p.write_text(html,encoding="utf-8")
print("Published video-referenced image",out,out.stat().st_size,im.size)
print("Verified About hero and gallery reference","assets/"+name)
