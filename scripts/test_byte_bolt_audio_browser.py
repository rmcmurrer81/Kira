#!/usr/bin/env python3
"""Real media playback and CPU-only UI regression in isolated Chromium contexts."""
import functools, http.server, json, threading, os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT/'docs')))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/arcade/byte-bolt/'
INIT="""(() => {
 const original=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(type,...args){if(['webgl','webgl2','experimental-webgl'].includes(type))return null;return original.call(this,type,...args)};
 window.testAudio=[];const Audio=window.Audio;window.Audio=function(...args){const a=new Audio(...args);window.testAudio.push(a);return a;};
 window.speechCalls=0;if(window.speechSynthesis){speechSynthesis.getVoices=()=>[];speechSynthesis.speak=()=>{window.speechCalls++;throw new Error('No system speech permitted in this test');};}
})();"""
report={}
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None),headless=True,args=['--no-sandbox','--disable-gpu'])
    context=browser.new_context(viewport={'width':1280,'height':800});context.add_init_script(INIT)
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url);page.locator('[data-go="yard"]').click();page.locator('.replay').click()
    page.wait_for_function('testAudio.length && !testAudio[0].paused && testAudio[0].currentTime > .35')
    report['first_dialogue']=page.locator('#dialogue-audio-status').inner_text()
    start=page.evaluate('TownScene.getMapInfo().frameCount');page.wait_for_timeout(1000);assert page.evaluate('TownScene.getMapInfo().frameCount')==start
    report['paused_scene_draws_per_second']=0
    page.locator('#chat-more').click();page.wait_for_function('testAudio[0].currentTime > .2');assert 'tidying' not in page.locator('.bubble p').inner_text()
    for _ in range(4):page.locator('.replay').click()
    page.wait_for_function('testAudio[0].currentTime > .2');page.keyboard.press('Escape');assert page.evaluate('testAudio[0].paused');page.wait_for_timeout(200);assert page.evaluate('TownScene.getMapInfo().frameCount')>start
    # All six residents speak without any OS voice or GPU.
    for place in ['yard','lab','store','gardener','walker','neighbor']:
        page.evaluate('(place)=>townTalk(place)',place);page.locator('.replay').click();page.wait_for_function('testAudio[0].currentTime > .2');page.keyboard.press('Escape')
    report['residents_with_playback']=6
    # Original recording is kept for the exact original introduction.
    page.locator('[data-go="yard"]').click();page.locator('#chat-project').click();page.wait_for_function('testAudio[0].currentTime > .2');assert page.evaluate('testAudio[0].src').endswith('audio/iris-intro.wav')
    page.keyboard.press('Escape');page.reload();page.locator('[data-go="yard"]').click();page.wait_for_function('testAudio.length && testAudio[0].currentTime > .2');report['preference_survived_reload']=True
    page.keyboard.press('Escape');page.locator('#settings').click();page.locator('#voice').click();assert page.evaluate('testAudio[0].paused');page.keyboard.press('Escape');page.locator('[data-go="yard"]').click();assert page.evaluate('testAudio[0].paused');assert 'off' in page.locator('#dialogue-audio-status').inner_text()
    page.keyboard.press('Escape');page.locator('#settings').click();page.locator('#test-voice').click();page.wait_for_function('testAudio[0].currentTime > .2');assert 'Playing' in page.locator('#voice-status').inner_text();report['test_voice_works']=True
    # End-to-end full sentence queue completes, not merely first clip play().
    page.wait_for_function('document.querySelector("#voice-status").textContent === "Finished reading."',timeout=15000)
    # Network errors remain visible and can be retried.
    page.route('**/audio/narrator/*.mp3',lambda route:route.abort())
    page.locator('#test-voice').click();page.wait_for_function('document.querySelector("#voice-status").textContent.includes("could not play")')
    page.unroute('**/audio/narrator/*.mp3');page.locator('#test-voice').click();page.wait_for_function('testAudio[0].currentTime > .2');report['failed_audio_retry_works']=True
    assert page.evaluate('speechCalls')==0
    page.screenshot(path='/tmp/byte-bolt-sound-check.png')
    # Turning off again makes the full campaign regression silent.
    page.locator('#voice').click();page.keyboard.press('Escape')
    jobs=page.evaluate('TownCore.jobs.map(j=>({id:j.id,part:j.part}))')
    for job in jobs:
        page.locator('#jobs').click();page.locator(f'[data-job="{job["id"]}"]').click()
        if page.locator('#accept').count():page.locator('#accept').click()
        if page.locator('#shop').count():
            page.locator('#shop').click();page.locator('#chat-shop').click();page.locator(f'[data-buy="{job["part"]}"]').click();page.locator('#back-board').click();page.locator(f'[data-job="{job["id"]}"]').click()
        challenge=page.evaluate('(id)=>TownCore.challenge(id)',job['id'])
        if challenge['kind']=='code':page.locator('#code').fill(challenge['example'])
        else:
            c=challenge['circuit'];page.locator('#minimum').fill(str(c['min']));page.locator('#resistance').select_option(str(c['resistance']));page.locator('#current').fill(str((c['supplyV']-c['ledV'])/c['resistance']*1000))
        page.locator('#submit').click();assert 'checks passed' in page.locator('#results').inner_text();page.keyboard.press('Escape')
    assert page.evaluate('townState.completed.length')==22
    report['campaign_projects_completed']=22
    assert not errors,errors
    mobile=browser.new_context(viewport={'width':390,'height':700});mobile.add_init_script(INIT);m=mobile.new_page();m.goto(url);m.locator('#settings').click();m.locator('#test-voice').click();m.wait_for_function('testAudio[0].currentTime > .2');assert m.evaluate('document.documentElement.scrollWidth<=innerWidth');report['mobile_width_no_overflow']=True
    m.screenshot(path='/tmp/byte-bolt-sound-mobile.png')
    report['page_errors']=errors;report['system_speech_calls']=0;print(json.dumps(report,indent=2));browser.close()
server.shutdown()
