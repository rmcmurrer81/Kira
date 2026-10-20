#!/usr/bin/env python3
"""Publish the SELECTED Kira Labs research-first homepage with existing assets.

No new illustration is generated. Two already-created, inspected images are
downloaded in their original high resolution, verified and compressed to WebP.
All headings, numbers, links and disclaimers remain native HTML.
"""
from pathlib import Path
from urllib.request import Request, urlopen
from io import BytesIO
from PIL import Image
import os, re, json

ROOT=Path("docs")
ASSETS=ROOT/"assets"
ASSETS.mkdir(parents=True,exist_ok=True)

def import_existing_asset(url,name):
    if not url.startswith("https://"):
        raise RuntimeError("Image URL missing or not HTTPS")
    req=Request(url,headers={"User-Agent":"Mozilla/5.0 (KiraLabs QA)","Accept":"image/*"})
    with urlopen(req,timeout=120) as resp:
        blob=resp.read(22_000_001)
        mime=resp.headers.get("Content-Type","")
    if len(blob)>22_000_000: raise RuntimeError("Oversized source asset: "+name)
    try:
        image=Image.open(BytesIO(blob))
        image.load()
    except Exception as exc:
        raise RuntimeError("Source was not an image: "+name+" "+mime) from exc
    if image.width<1500 or image.height<850:
        raise RuntimeError("Source image not high resolution: "+name+" "+str(image.size))
    path=ASSETS/name
    image.convert("RGB").save(path,format="WEBP",quality=94,method=6)
    with Image.open(path) as check:
        check.verify()
    print("Verified original image",path,image.size,path.stat().st_size)
    return path

import_existing_asset(os.environ["KIRA_EXISTING_NEURAL_URL"],"home-neural-highres-20261020.webp")
import_existing_asset(os.environ["KIRA_EXISTING_ROBOT_URL"],"companion-robot-highres-20261020.webp")

main_html="""<main id="main" class="hl-content">
<section class="hl-hero" aria-labelledby="hl-hero-title">
  <div class="hl-hero-photo"><img src="assets/home-neural-highres-20261020.webp" alt="Cinematic concept illustration of an illuminated neural network and humanlike profile, not a runtime image or proof of intelligence" width="1672" height="941" decoding="async" fetchpriority="high"/></div>
  <div class="hl-shell hl-hero-inner">
    <div class="hl-hero-copy">
      <p class="hl-eye"><span class="live-dot" aria-hidden="true"></span> Independent research for real-world impact</p>
      <h1 id="hl-hero-title">Research today.<em>More capable tomorrows.</em></h1>
      <p class="hl-hero-lede">Kira Labs builds experimental AI systems that study learning, memory and continuity. Our projects connect cognitive research, synthetic people, medical-avatar studies and future robotics—with measured results and clear limitations.</p>
      <div class="hl-actions">
        <a class="button primary" href="research.html">Explore our research <span aria-hidden="true">→</span></a>
        <a class="button" href="research.html#watch-videos">Watch overview videos <span aria-hidden="true">▷</span></a>
      </div>
    </div>
    <p class="hl-hero-micro" aria-hidden="true">Understanding intelligence<br/>to improve lives.</p>
  </div>
</section>

<section class="hl-evidence" aria-labelledby="hl-evidence-title" id="evidence">
  <div class="hl-shell">
    <div class="hl-evidence-header">
      <div>
        <p class="hl-eye">Research evidence · updated October 20, 2026</p>
        <h2 id="hl-evidence-title">Measured results.<br/><em>Clear limitations.</em></h2>
      </div>
      <div>
        <p class="hl-evidence-lede">Documented experiments include both passing engineering checks and learning setbacks. The numerical tests are internally verified; external replication and broader learning demonstrations remain open.</p>
        <a class="hl-evidence-more" href="newbrain.html#newbrain-verified-2026-10-20">View the methods and results →</a>
      </div>
    </div>
    <div class="hl-metrics">
      <a class="hl-metric" href="newbrain.html#newbrain-verified-2026-10-20"><small>Original12 · 256-update assessment</small><strong>2/12 → 2/12</strong><span>No net learning score improvement</span></a>
      <a class="hl-metric" href="newbrain.html#sampled-gradient-pass-2026-10-19"><small>Sampled numerical derivatives</small><strong>80/80 + 4/4</strong><span>Coordinates and directions passed</span></a>
      <a class="hl-metric" href="newbrain.html#newbrain-verified-2026-10-20"><small>One-step training-update check</small><strong>11,914 / 11,914</strong><span>Expected parameter values matched</span></a>
      <a class="hl-metric" href="newbrain.html#newbrain-short-teaching-2026-10-20"><small>Separate short teaching pilot</small><strong>2/3 → 3/3</strong><span>Trained answers passed; cold restart pending</span></a>
    </div>
    <p class="hl-evidence-caveat">These results measure different experiments and must not be combined into one score. A separate five-question trial declined from <strong>2/5 to 0/5</strong> after training and remained 0/5 after reload. The short 3/3 result involved explicitly rehearsed cases, not held-out generalization. Sampled gradients and one-step update accuracy do not independently establish useful new learning.</p>
  </div>
</section>

<section class="hl-programs" aria-labelledby="hl-programs-title" id="projects">
  <div class="hl-shell">
    <div class="hl-section-head">
      <div><p class="hl-eye">Explore our research programs</p><h2 id="hl-programs-title">Distinct projects. A connected vision.</h2></div>
      <a href="projects.html">All projects →</a>
    </div>
    <div class="hl-grid">
      <a class="hl-program" href="newbrain.html"><div class="hl-program-heading"><strong>NewBrain</strong><span>Cognitive architecture research</span></div><img src="assets/home-neural-highres-20261020.webp" alt="Neural cognitive research concept, not a software screenshot" loading="lazy" decoding="async" width="1672" height="941"/><div class="hl-program-copy"><p>Experimental learning and memory with verified engineering checks and unresolved acquisition tests.</p><span class="hl-go">Explore NewBrain →</span></div></a>
      <a class="hl-program" href="patient-horizon.html"><div class="hl-program-heading"><strong>Patient Horizon</strong><span>AI for medical records</span></div><img src="assets/patient-horizon-clinical-avatar-concept-2026-10-18.jpg" alt="Concept of physician-reviewed anatomical patient data, not a clinical simulation" loading="lazy" decoding="async"/><div class="hl-program-copy"><p>Versioned synthetic patient records, anatomy concepts and proposed clinician-reviewed research.</p><span class="hl-go">Explore Patient Horizon →</span></div></a>
      <a class="hl-program" href="kira-world.html"><div class="hl-program-heading"><strong>Kira World</strong><span>Persistent AI environments</span></div><img src="assets/kira-hero-landscape.webp" alt="Kira in a virtual apartment with Lisa on a screen, conceptual environment" loading="lazy" decoding="async"/><div class="hl-program-copy"><p>Continuing identities, shared virtual spaces and distinct personal memories.</p><span class="hl-go">Explore Kira World →</span></div></a>
      <a class="hl-program" href="evelyn-hart.html"><div class="hl-program-heading"><strong>Evelyn Hart</strong><span>AI and technology historian</span></div><img src="assets/evelyn-hart-demo-concept-2026-10-19.webp" alt="Illustration of Evelyn Hart, a historian assistant whose runtime evaluation remains pending" loading="lazy" decoding="async"/><div class="hl-program-copy"><p>Developing source-grounded history, reading continuity and conversational research.</p><span class="hl-go">Meet Evelyn Hart →</span></div></a>
      <a class="hl-program" href="companion-robotics.html"><div class="hl-program-heading"><strong>Companion Robotics</strong><span>From research to real-world robots</span></div><img src="assets/companion-robot-highres-20261020.webp" alt="Detailed concept illustration of a humanoid android; proposed architecture, no operating robot" loading="lazy" decoding="async" width="1672" height="941"/><div class="hl-program-copy"><p>A proposed ROS 2 route between separate cognition, identity, safeguards and physical endpoints.</p><span class="hl-go">Explore Companion Robotics →</span></div></a>
    </div>
  </div>
</section>

<section class="hl-mission" aria-labelledby="hl-mission-title">
  <div class="hl-shell hl-mission-inner">
    <div><p class="hl-eye">About Kira Labs</p><h2 id="hl-mission-title">Evidence first.<br/><em>A more capable and humane future.</em></h2></div>
    <div class="hl-mission-copy"><p>Kira Labs is an independent AI research initiative based in Newark, New Jersey. We explore cognitive architectures, persistent synthetic identities, accessible technology and future medical and robotic applications—while documenting what works and what still needs testing.</p><div class="hl-actions"><a class="button primary" href="about.html">About Kira Labs →</a><a class="button" href="progress.html">Research timeline →</a></div></div>
  </div>
</section>

<section class="hl-morework" aria-label="Additional Kira Labs software">
  <div class="hl-shell hl-morework-inner"><strong>Also building</strong><a href="shiftbrief.html">ShiftBrief — free Windows app</a><a href="video-studio.html">Video Studio</a><a href="sarah-travel.html">Sarah Travel</a><a href="research.html#healthspan-lab">Healthspan Lab</a><a href="partners.html">Research partnerships</a></div>
</section>
</main>"""
homepage=ROOT/"index.html"
old=homepage.read_text(encoding="utf-8")
assert '<main id="main">' in old and '</main>' in old, "Original main section missing"
new=re.sub(r'<main id="main">.*?</main>',main_html,old,count=1,flags=re.S)
new=new.replace('<body class="home">','<body class="home hl-home">')
new=new.replace('Big worlds. Useful tools. — Kira Labs','Research today. More capable tomorrows. — Kira Labs')
new=new.replace('Explore Kira Labs projects, including Patient Horizon, NewBrain research, free ShiftBrief and the lab-wide timeline.','Explore Kira Labs experimental AI research, measured NewBrain results, Kira World, Patient Horizon and future companion robotics.')
new=new.replace('Explore Kira Labs projects, free ShiftBrief and the lab-wide timeline.','Research today for more capable tomorrows: verified engineering progress, clearly limited tests, and emerging AI projects.')
new=new.replace("</head>",'<link rel="stylesheet" href="home-evidence-first-20261020.css?v=4"/></head>',1)
assert new.count('class="hl-program"')==5
homepage.write_text(new,encoding="utf-8")

newbrain=ROOT/"newbrain.html"
nhtml=newbrain.read_text(encoding="utf-8")
old_ref="assets/hero-newbrain-neural-preview-20261020.webp"
assert old_ref in nhtml
nhtml=nhtml.replace(old_ref,"assets/home-neural-highres-20261020.webp")
nhtml=nhtml.replace("website-visual-target-20261020.css?v=20261020-final-5","website-visual-target-20261020.css?v=20261020-final-8")
newbrain.write_text(nhtml,encoding="utf-8")

robot=ROOT/"companion-robotics.html"
rhtml=robot.read_text(encoding="utf-8")
old_robot="assets/kira-humanoid-robot-hd-20261020.webp"
assert old_robot in rhtml
rhtml=rhtml.replace(old_robot,"assets/companion-robot-highres-20261020.webp")
rhtml=rhtml.replace("website-visual-target-20261020.css?v=20261020-final-5","website-visual-target-20261020.css?v=20261020-final-8")
robot.write_text(rhtml,encoding="utf-8")

# Override ONLY image framing; no other project page or program behavior changes.
styles=ROOT/"website-visual-target-20261020.css"
sc=styles.read_text(encoding="utf-8")
flag="/* final high-resolution source framing — no hero crops */"
if flag not in sc:
    sc+=str("""
/* final high-resolution source framing — no hero crops */
@media (min-width:901px){
  .xf-page.xf-brain .xf-hero-brain .xf-hero-visual{
    background:linear-gradient(90deg,#061321 0%,#0c2440 80%)!important;
  }
  .xf-page.xf-brain .xf-hero-brain .xf-hero-visual>img{
    position:absolute!important;top:0!important;bottom:0!important;right:0!important;left:auto!important;
    display:block!important;width:100%!important;height:100%!important;
    object-fit:contain!important;object-position:right center!important;
    -webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 34%,#000 100%)!important;
    mask-image:linear-gradient(90deg,transparent 0%,#000 34%,#000 100%)!important;
    filter:none!important;
  }
  .xf-page.xf-robot .xf-hero-robot .xf-hero-visual{
    background:linear-gradient(90deg,#061421,#12304a 70%,#0b1a32)!important;
  }
  .xf-page.xf-robot .xf-hero-robot .xf-hero-visual>img{
    display:block!important;width:100%!important;height:100%!important;
    object-fit:contain!important;object-position:right center!important;
    -webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 32%,#000 100%)!important;
    mask-image:linear-gradient(90deg,transparent 0%,#000 32%,#000 100%)!important;
    filter:none!important;
  }
}
@media(max-width:900px){
  .xf-page.xf-brain .xf-hero-brain .xf-hero-visual>img,
  .xf-page.xf-robot .xf-hero-robot .xf-hero-visual>img{
    object-fit:contain!important;object-position:center center!important;
    -webkit-mask-image:none!important;mask-image:none!important;
  }
}
""")
    styles.write_text(sc,encoding="utf-8")

from bs4 import BeautifulSoup
soup=BeautifulSoup(new,'html.parser')
for a in soup.select('a[href]'):
    assert a.get("href"),"Broken empty link"
imgs=[img.get("src") for img in soup.select('main img')]
for src in imgs:
    if not src.startswith("http"):
        assert (ROOT/src).is_file(),"Missing website image "+src
for name in ["home-neural-highres-20261020.webp","companion-robot-highres-20261020.webp"]:
    assert (ASSETS/name).stat().st_size>150_000
print("FINAL HOME CHECK: five cards, four measured results, readable copy, existing nav/footer, all local assets present.")
