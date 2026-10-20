from pathlib import Path
import json
import time
import os
BASE_URL=os.environ.get('KIRA_QA_BASE','http://127.0.0.1:8765/').rstrip('/')+'/'
MODE_SUFFIX='-live' if 'kiralabs.org' in BASE_URL else ''
from playwright.sync_api import sync_playwright

out=Path("qa/visual-review")
out.mkdir(exist_ok=True,parents=True)
pages=["index.html","kira-world.html","about.html","contact.html","companion-robotics.html","newbrain.html"]
report=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox"])
    for device,viewport in [("desktop",{"width":1440,"height":900}),("wide",{"width":1980,"height":900}),("mobile",{"width":390,"height":844})]:
        context=browser.new_context(viewport=viewport,device_scale_factor=1)
        for name in pages:
            page=context.new_page()
            errors=[]
            page.on("pageerror",lambda err: errors.append(str(err)))
            page.goto(BASE_URL+name+"?visual_qa=20261020-final-4",wait_until="domcontentloaded",timeout=45000)
            page.wait_for_timeout(750)
            path=out/(name.replace(".html","")+"-"+device+MODE_SUFFIX+".jpg")
            page.screenshot(path=str(path),quality=87,type="jpeg",full_page=False)
            geometry=page.evaluate("""() => {
              const sel=['.xf-hero','.xf-hero-copy','.xf-hero-visual','.xf-hero-visual>img','.xf-display','.xf-world-panorama','.xf-section','.xf-card-grid','.hl-hero','.hl-hero-photo','.hl-evidence','.hl-programs'];
              const result={}; for(const s of sel){const e=document.querySelector(s); if(!e)continue; const r=e.getBoundingClientRect();result[s]={x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};}
              result.scrollWidth=document.documentElement.scrollWidth;
              result.viewportWidth=innerWidth;
              result.heroImgNaturalWidth=document.querySelector('.xf-hero-visual img')?.naturalWidth;
              result.heroImgNaturalHeight=document.querySelector('.xf-hero-visual img')?.naturalHeight;
              return result;
            }""")
            report.append({"page":name,"device":device,"geometry":geometry,"errors":errors,"screenshot":str(path)})
            print(f"{name} {device}: {path}, hero {geometry.get('.xf-hero')}, media {geometry.get('.xf-hero-visual')}, overflow={geometry['scrollWidth']-geometry['viewportWidth']}")
            if name in ("index.html","kira-world.html","about.html"):
                page.evaluate("window.scrollTo(0, Math.min(520, document.body.scrollHeight - innerHeight))")
                page.wait_for_timeout(180)
                second=out/(name.replace(".html","")+"-"+device+MODE_SUFFIX+"-below-hero.jpg")
                page.screenshot(path=str(second),quality=87,type="jpeg",full_page=False)
                print("Below-hero screenshot:",second)
            page.close()
        context.close()
    browser.close()
(out/"geometry.json").write_text(json.dumps(report,indent=2))
