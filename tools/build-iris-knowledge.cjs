/* Build from the complete, locally checked public repository; no visitor input. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),docs=path.join(root,'docs');
async function main(){
  const win={};vm.runInNewContext(fs.readFileSync(path.join(docs,'sarah-packs.js'),'utf8'),{window:win,crypto:crypto.webcrypto,TextEncoder,URL,AbortController,setTimeout,clearTimeout});
  const baseText=fs.readFileSync(path.join(docs,'sarah-knowledge.json'),'utf8');
  const loaded=await win.SarahPacks.load(baseText,async file=>({ok:true,text:async()=>fs.readFileSync(path.join(docs,file),'utf8')}),null);
  if(loaded.mode!=='packs')throw Error('Full validated knowledge packs are required; no partial-bank deployment.');
  const policy=require(path.join(docs,'iris-policy.js')),k=policy.prepare(loaded.knowledge);
  if(k.book_catalogue.length!==29||!k.topics.some(t=>t.id==='entertainment'))throw Error('Preserved-book or credit coverage changed; review explicitly.');
  const sources=k.sources,entries=[],excluded=/ClearTrail|CutBrief|Kira Sequence Desk|Production Director|\bCarry On\b/i;
  const ignored=new Set(['privacy','voice','contact']);
  const urlFor=ids=>{for(const id of ids||[]){const s=sources[id];if(!s)continue;try{const u=new URL(s.url,'https://kiralabs.org/');if(u.protocol==='https:'&&!/\.(?:json|js|py)(?:[?#]|$)/i.test(u.href)&&!excluded.test(u.href))return u.href;}catch{}}return 'https://kiralabs.org/knowledge.html';};
  function add(id,title,text,ids,topic,tags=[]){if(!text||excluded.test(text)||typeof title!=='string')return;
    const parts=String(text).match(/[\s\S]{1,2200}(?:\s|$)/g)||[String(text).slice(0,2200)];
    parts.forEach((part,i)=>entries.push({id:id+(parts.length>1?'.'+i:''),title,text:part.trim(),url:urlFor(ids),topic,tags}));
  }
  for(const t of k.topics){if(ignored.has(t.id))continue;add('topic:'+t.id,t.title,t.answer,t.sources,t.id,t.terms||[]);for(const [facet,f]of Object.entries(t.followups||{}))add('topic:'+t.id+':'+facet,t.title+' · '+facet,f.answer,f.sources||t.sources,t.id,[...(t.terms||[]),facet]);}
  for(const f of k.public_packs.facts){if(f.subject_ids.some(id=>ignored.has(id)))continue;add('fact:'+f.id,k.topics.find(t=>f.subject_ids.includes(t.id))?.title||'Published detail',f.statement,f.sources,f.subject_ids[0],f.questions||[]);}
  for(const b of k.book_catalogue)add('book:'+b.source,b.title,b.title+'. '+(b.summary||'This is a published catalogue listing, not a full manuscript.'),[b.source],'books',[b.title,'book']);
  for(const [focus,text]of Object.entries(k.bio))if(typeof text==='string')add('bio:'+focus,'Robert McMurrer · '+focus,text,k.bio.sources,'robert',['biography',focus]);
  const decode=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#(?:39|x27);/gi,"'").replace(/&nbsp;/g,' ');
  const plain=s=>decode(s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
  for(const page of ['about.html','kira-world.html','shiftbrief.html','video-studio.html','sarah-travel.html','support.html']){
    const html=fs.readFileSync(path.join(docs,page),'utf8'),main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||'';
    let i=0;for(const section of main.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)){
      const title=plain(section[2].match(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/i)?.[1]||page.replace('.html',''));
      const id=section[1].match(/\bid="([a-z0-9-]+)"/i)?.[1];
      const paragraphs=[...section[2].matchAll(/<(?:p|blockquote)\b[^>]*>([\s\S]*?)<\/(?:p|blockquote)>/gi)].map(m=>plain(m[1])).filter(t=>t.length>35).join(' ');
      if(!paragraphs||excluded.test(paragraphs))continue;
      const key='page-'+page+'-'+i++;sources[key]={label:title,url:page+(id?'#'+id:'')};
      add(key,title,paragraphs,[key],page.replace('.html',''),[page.replace('.html',''),title]);
    }
  }
  // These describe the enhanced mode, not the preserved standard-mode runtime.
  entries.push({id:'enhanced:privacy',title:'Enhanced Iris privacy choices',text:'Enhanced matching processes your question and recent conversation through Cloudflare. Sharing future questions and answers with Robert is optional and off by default. Shared records expire within 30 days and may appear in his weekly email. Optional device memory keeps the conversation on your device. Delete saved conversation removes this session’s stored records, but cannot recall delivered email. New facts require Robert’s approval.',url:'https://kiralabs.org/privacy.html#enhanced-iris',topic:'privacy',tags:['privacy','saved','remember','learn','Iris','record','storage']});
  entries.push({id:'enhanced:contact',title:'Contact Robert',text:'Use the contact form to send Robert a message directly. You can also call or text his public Google Voice number, (317) 586-8199. His public email is rmcmurrer@kiralabs.org. Chatting with Iris is not itself a direct contact request, even when you choose to share the chat for review.',url:'https://kiralabs.org/contact.html',topic:'contact',tags:['call','text','contact','phone','email','Robert']});
  const out={version:'iris-free-2026-09-14-'+crypto.createHash('sha256').update(JSON.stringify(entries)).digest('hex').slice(0,12),coverage:{complete:true,sourceVersion:k.public_packs.content_version,topics:k.topics.length,books:k.book_catalogue.length,facts:k.public_packs.facts.length},entries};
  fs.writeFileSync(path.join(root,'services/iris-free/knowledge.json'),JSON.stringify(out,null,2)+'\n');
  console.log(JSON.stringify({knowledgeBuilt:true,version:out.version,coverage:out.coverage,entries:entries.length}));
}
main().catch(e=>{console.error(e.message);process.exit(1);});
