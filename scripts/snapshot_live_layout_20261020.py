from pathlib import Path
import json
import time
from playwright.sync_api import sync_playwright

out=Path("qa/visual-review")
out.mkdir(exist_ok=True,parents=True)
pages=["kira-world.html","about.html","contact.html","companion-robotics.html","newbrain.html"]
report=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox"])
    for device,viewport in [("desktop",{"width":1440,"height":900}),("mobile",{"width":390,"height":844})]:
        context=browser.new_context(viewport=viewport,device_scale_factor=1)
        for name in pages:
            page=context.new_page()
            errors=[]
            page.on("pageerror",lambda err: errors.append(str(err)))
            page.goto("http://127.0.0.1:8765/"+name,wait_until="domcontentloaded",timeout=45000)
            page.wait_for_timeout(750)
            path=out/(name.replace(".html","")+"-"+device+".jpg")
            page.screenshot(path=str(path),quality=87,type="jpeg",full_page=False)
            geometry=page.evaluate("""() => {
              const sel=['.xf-hero','.xf-hero-copy','.xf-hero-visual','.xf-hero-visual>img','.xf-display','.xf-world-panorama','.xf-section','.xf-card-grid'];
              const result={}; for(const s of sel){const e=document.querySelector(s); if(!e)continue; const r=e.getBoundingClientRect();result[s]={x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};}
              result.scrollWidth=document.documentElement.scrollWidth;
              result.viewportWidth=innerWidth;
              result.heroImgNaturalWidth=document.querySelector('.xf-hero-visual img')?.naturalWidth;
              result.heroImgNaturalHeight=document.querySelector('.xf-hero-visual img')?.naturalHeight;
              return result;
            }""")
            report.append({"page":name,"device":device,"geometry":geometry,"errors":errors,"screenshot":str(path)})
            print(f"{name} {device}: {path}, hero {geometry.get('.xf-hero')}, media {geometry.get('.xf-hero-visual')}, overflow={geometry['scrollWidth']-geometry['viewportWidth']}")
            page.close()
        context.close()
    browser.close()
(out/"geometry.json").write_text(json.dumps(report,indent=2))
