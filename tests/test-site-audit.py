"""Static public-page checks. Does not claim external image or video playback."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import hashlib, re, json
ROOT=Path(__file__).resolve().parents[1]; DOCS=ROOT/'docs'
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__(); self.links=[]; self.images=[]; self.ids=set(); self.in_footer=False; self.footer=[]; self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        if tag=='footer': self.in_footer=True
        if tag=='a':
            self.links.append(a.get('href',''))
            if self.in_footer: self.footer.append(a.get('href',''))
        if tag=='img': self.images.append(a)
    def handle_endtag(self,tag):
        if tag=='footer': self.in_footer=False
pages={p.name:Page(p.read_text()) for p in DOCS.glob('*.html')}; checks=0
for name,p in pages.items():
    for target in ['index.html','projects.html','progress.html','about.html','support.html','contact.html']:
        assert target in p.footer,(name,'missing static footer',target);checks+=1
    for link in p.links:
        u=urlparse(link)
        if u.scheme in ['http','https'] and u.hostname!='kiralabs.org': continue
        if u.scheme in ['mailto','tel','sms']:continue
        target=u.path.lstrip('/') or name
        if target not in pages:continue
        if u.fragment and target!='progress.html':
            assert unquote(u.fragment) in pages[target].ids,(name,'missing anchor',link);checks+=1
for name in ['index.html','projects.html','kira-world.html','shiftbrief.html','video-studio.html','sarah-travel.html']:
    text=(DOCS/name).read_text();main=re.search(r'<main\b[^>]*>([\s\S]*?)</main>',text)[1];assert 'href="contact.html"' in main;checks+=1
world=(DOCS/'kira-world.html').read_text()
assert '<a href="updates.html">Read the dated evidence</a>' in world;checks+=1
assert '<a href="contact.html">ask Robert</a>' in world;checks+=1
notebook=[x for x in pages['kira-world.html'].images if 'Notebook Worlds' in x.get('alt','')]
assert notebook and all(x.get('src','').endswith('kira-world-ecosystem.webp') for x in notebook);checks+=1
assert '</img>' not in world;checks+=1
contact=(DOCS/'contact.html').read_text()
form=re.search(r'<form\b[^>]*id="contact-form"[\s\S]*?</form>',contact)[0]
assert hashlib.sha256(form.encode()).hexdigest()=='3f905bdc47833b39072ad41be864d3c96ad902fbf89bf283bce8af06015c5e57';checks+=1
assert '(317) 586-8199' in contact;checks+=1
assert 'enabled: false' in (DOCS/'iris-enhanced-config.js').read_text();checks+=1
for name in ['projects.html','updates.html','video-studio.html']:
    assert not re.search(r'ClearTrail|CutBrief|Kira Sequence Desk|Production Director|\bCarry On\b',(DOCS/name).read_text());checks+=1
assert 'id="press"' in (DOCS/'about.html').read_text();checks+=1
assert 'ShiftBrief' in (DOCS/'sarah-travel.html').read_text().split('id="sarah-identities"')[1];checks+=1
print(json.dumps({'static_checks':checks,'pages':len(pages),'result':'PASS','external_playback':'not tested'}))
