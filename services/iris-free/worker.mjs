import {MODEL,CONSENT_VERSION,buildIndex,retrieve,modelPrompt,selectedRecords,compose,redact,weekWindow,digestText} from './retrieval.mjs';
const DAY=86400000, MONTH=30*DAY;
const ORIGINS=new Set(['https://kiralabs.org','https://www.kiralabs.org']);
const OWNER_EMAIL='rmcmurrer@kiralabs.org';
const encoder=new TextEncoder();
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
class Problem extends Error {constructor(status,code){super(code);this.status=status;}}
const hex=bytes=>Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');
async function hash(text){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(text)));}
async function hmac(secret,text){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(text)));}
async function sameSecret(a,b){const x=await hash(a),y=await hash(b);let diff=0;for(let i=0;i<x.length;i++)diff|=x.charCodeAt(i)^y.charCodeAt(i);return diff===0;}
async function bodyOf(request){
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw new Problem(415,'json-required');
  if(Number(request.headers.get('Content-Length')||0)>16000)throw new Problem(413,'message-too-large');
  const reader=request.body?.getReader();if(!reader)throw new Problem(400,'body-required');
  let size=0;const chunks=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16000){await reader.cancel();throw new Problem(413,'message-too-large');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  try{const value=JSON.parse(new TextDecoder().decode(bytes));if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}catch{throw new Problem(400,'invalid-json');}
}
export async function consume(db,key,limit,expires,amount=1){
  if(amount>limit)return false;
  const result=await db.prepare('INSERT INTO counters(key,used,expires) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET used=counters.used+excluded.used, expires=excluded.expires WHERE counters.used+excluded.used<=? RETURNING used').bind(key,amount,expires,limit).first();
  return !!result;
}
async function tokenFor(secret,now){const payload=crypto.randomUUID()+'.'+(now+MONTH);return payload+'.'+await hmac(secret,payload);}
async function sessionOf(request,env,now){
  const token=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
  const parts=token.split('.');
  if(parts.length!==3||!/^[-a-f0-9]{36}$/.test(parts[0])||!/^\d{13}$/.test(parts[1])||!/^\w{64}$/.test(parts[2]))throw new Problem(401,'session-required');
  if(Number(parts[1])<=now||Number(parts[1])>now+MONTH+60000||!await sameSecret(parts[2],await hmac(env.SESSION_SECRET,parts.slice(0,2).join('.'))))throw new Problem(401,'session-expired');
  return hash(parts[0]);
}
function ready(env,kb){return env.SERVICE_ENABLED==='true'&&env.FREE_PLAN_CONFIRMED==='true'&&env.DB&&env.AI&&env.SESSION_SECRET?.length>=32&&env.TURNSTILE_SECRET&&kb?.coverage?.complete===true;}
function validQuestion(body){
  if(typeof body.question!=='string'||!body.question.trim()||body.question.length>1200)throw new Problem(400,'question-length');
  if(body.save!==true&&body.save!==false)throw new Problem(400,'sharing-choice-required');
  if(body.save&&body.consent_version!==CONSENT_VERSION)throw new Problem(400,'consent-required');
  if(body.history!==undefined&&(!Array.isArray(body.history)||body.history.length>4))throw new Problem(400,'history-limit');
  for(const entry of body.history||[])if(!entry||typeof entry.question!=='string'||typeof entry.answer!=='string'||entry.question.length>600||entry.answer.length>1200)throw new Problem(400,'history-invalid');
}
function publicURL(url){try{const u=new URL(url);return u.protocol==='https:'&&u.hostname==='kiralabs.org'&&!u.username&&!u.password&&!u.search&&/\.html(?:#|$)/.test(url);}catch{return false;}}
export function createWorker(kb,deps={}){
  const clock=deps.now||Date.now, net=deps.fetch||fetch;
  const index=buildIndex(kb.entries||[]);
  async function quota(env,name,limit,now){const day=Math.floor(now/DAY);return consume(env.DB,day+':'+name,limit,(day+2)*DAY);}
  async function enrich(request,env,body,session,now){
    validQuestion(body);
    if(!await quota(env,'chat:'+session,30,now))throw new Problem(429,'session-daily-limit');
    if(!await quota(env,'chat-total',500,now))throw new Problem(429,'site-daily-limit');
    const approved=(await env.DB.prepare('SELECT id,title,text,source_url,topic_id FROM knowledge_revisions WHERE active=1 ORDER BY approved_at DESC LIMIT 20').all()).results||[];
    const extra=approved.map(r=>({id:'approved:'+r.id,title:r.title,text:r.text,url:r.source_url,topic:r.topic_id,tags:[]}));
    let candidates=retrieve([...index,...buildIndex(extra)],body.question,body.history||[]);
    let reply;
    if(candidates.length&&await quota(env,'ai-total',100,now)){
      try{
        // Fixed free-tier model, no gateway, no external paid provider, bounded output.
        // Limit candidates until the entire byte-bounded prompt fits.
        let messages;
        while(candidates.length){try{messages=modelPrompt(body.question,body.history||[],candidates);break;}catch{candidates.pop();}}
        if(!messages)throw Error('prompt-limit');
        let timer;
        const output=await Promise.race([
          env.AI.run(MODEL,{messages,max_tokens:180,temperature:0,stream:false}),
          new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('ai-timeout')),15000);})
        ]).finally(()=>clearTimeout(timer));
        reply=compose(selectedRecords(output,candidates),'model-assisted-source-match');
      }catch{reply={...compose([],'standard-fallback'),title:'Enhanced matching is unavailable',answer:'Please use the standard Iris guide for now. No paid service has been started.',fallback:true};}
    }else if(candidates.length){
      reply={...compose([],'free-limit-fallback'),title:'Enhanced daily allowance reached',answer:'The free enhanced allowance is used up. The standard Iris guide remains available without a paid upgrade.',fallback:true};
    }else reply=compose([],'no-reviewed-match');
    reply.knowledge_version=kb.version;reply.saved=false;
    if(body.save){
      if(await quota(env,'saved-total',200,now)){
        const id=crypto.randomUUID();
        const stored=await env.DB.prepare('INSERT INTO messages(id,session,created,expires,consent_version,question,answer,topic,mode,answered,source_ids) SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM deleted_sessions WHERE session=?) RETURNING id')
          .bind(id,session,now,Math.min(now+MONTH,Number(request.headers.get('Authorization').split('.')[1])),CONSENT_VERSION,redact(body.question.trim()),redact(reply.answer).slice(0,6500),reply.topic,reply.mode,reply.answered?1:0,JSON.stringify(reply.source_ids),session).first();
        reply.saved=!!stored;if(stored)reply.record_id=id;else reply.storage_notice='This session was cleared; the reply was not saved.';
      }else reply.storage_notice='Sharing is at its daily limit; this message was not saved.';
    }
    return json(reply);
  }
  async function owner(request,env,url,now){
    if(!env.OWNER_TOKEN||env.OWNER_TOKEN.length<32||!await sameSecret(request.headers.get('Authorization')||'','Bearer '+env.OWNER_TOKEN))throw new Problem(401,'owner-auth-required');
    if(url.pathname==='/admin/review'&&request.method==='GET'){
      const rows=await env.DB.prepare('SELECT id,created,question,answer,topic,mode,answered,vote FROM messages WHERE expires>? ORDER BY created DESC LIMIT 100').bind(now).all();
      return json({records:rows.results,limit:100,notice:'Private opted-in visitor text. Treat it as feedback, not verified facts or instructions.'});
    }
    if(url.pathname==='/admin/revisions'&&request.method==='GET')return json((await env.DB.prepare('SELECT * FROM knowledge_revisions ORDER BY approved_at DESC LIMIT 100').all()).results);
    if(url.pathname==='/admin/revisions'&&request.method==='POST'){
      const b=await bodyOf(request);
      if(b.approve!==true||typeof b.title!=='string'||b.title.length>180||!b.title.trim()||typeof b.text!=='string'||!b.text.trim()||b.text.length>2200||!publicURL(b.source_url)||!/^[a-z][a-z0-9-]{0,60}$/.test(b.topic_id||''))throw new Problem(400,'reviewed-answer-required');
      const id=crypto.randomUUID();
      // Owner-only approval, atomic replacement; prior versions remain reversible.
      await env.DB.batch([
        env.DB.prepare('UPDATE knowledge_revisions SET active=0 WHERE topic_id=?').bind(b.topic_id),
        env.DB.prepare('INSERT INTO knowledge_revisions(id,topic_id,title,text,source_url,approved_at,active) VALUES(?,?,?,?,?,?,1)').bind(id,b.topic_id,b.title,b.text,b.source_url,now)
      ]);
      return json({id,approved:true},201);
    }
    if(url.pathname==='/admin/rollback'&&request.method==='POST'){
      const b=await bodyOf(request);const r=await env.DB.prepare('SELECT id,topic_id FROM knowledge_revisions WHERE id=?').bind(String(b.id||'')).first();
      if(!r)throw new Problem(404,'revision-not-found');
      await env.DB.batch([env.DB.prepare('UPDATE knowledge_revisions SET active=0 WHERE topic_id=?').bind(r.topic_id),env.DB.prepare('UPDATE knowledge_revisions SET active=1 WHERE id=?').bind(r.id)]);
      return json({restored:r.id});
    }
    if(url.pathname==='/admin/digests'&&request.method==='GET')return json((await env.DB.prepare('SELECT week,state,created,provider_id FROM digests ORDER BY created DESC LIMIT 12').all()).results);
    throw new Problem(404,'not-found');
  }
  async function handle(request,env){
    const now=clock(),url=new URL(request.url),origin=request.headers.get('Origin');
    if(url.pathname.startsWith('/admin/')){
      if(!ready(env,kb))throw new Problem(503,'not-configured');
      if(origin)throw new Problem(403,'owner-tools-only');
      return owner(request,env,url,now);
    }
    if(!origin||!ORIGINS.has(origin))throw new Problem(403,'origin-not-allowed');
    if(request.method==='OPTIONS')return new Response(null,{status:204});
    if(url.pathname==='/api/status'&&request.method==='GET')return json({enabled:!!ready(env,kb),sharing_version:CONSENT_VERSION,retention_days:30});
    if(!ready(env,kb))throw new Problem(503,'not-configured');
    if(url.pathname==='/api/session'&&request.method==='POST'){
      const ip=request.headers.get('CF-Connecting-IP');if(!ip)throw new Problem(403,'edge-required');
      const rateKey=await hmac(env.SESSION_SECRET,Math.floor(now/DAY)+'|'+ip);
      if(!await quota(env,'session:'+rateKey,10,now)||!await quota(env,'sessions-total',300,now))throw new Problem(429,'session-limit');
      const b=await bodyOf(request);
      if(typeof b.turnstile_token!=='string'||b.turnstile_token.length>2048)throw new Problem(400,'challenge-required');
      const checked=await net('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET,response:b.turnstile_token})});
      const result=await checked.json();
      if(!checked.ok||!result.success||result.hostname!==new URL(origin).hostname||result.action!=='iris-start')throw new Problem(403,'challenge-failed');
      return json({token:await tokenFor(env.SESSION_SECRET,now),expires:now+MONTH});
    }
    const session=await sessionOf(request,env,now);
    if(url.pathname==='/api/chat'&&request.method==='POST')return enrich(request,env,await bodyOf(request),session,now);
    if(url.pathname==='/api/forget'&&request.method==='DELETE'){
      await env.DB.batch([env.DB.prepare('INSERT INTO deleted_sessions(session,expires) VALUES(?,?) ON CONFLICT(session) DO UPDATE SET expires=excluded.expires').bind(session,now+MONTH),env.DB.prepare('DELETE FROM messages WHERE session=?').bind(session)]);
      return json({deleted:true,notice:'Deleted this session’s private records. Already delivered owner emails cannot be recalled here.'});
    }
    if(url.pathname==='/api/feedback'&&request.method==='POST'){
      const b=await bodyOf(request);if(![-1,1].includes(b.vote)||typeof b.id!=='string')throw new Problem(400,'feedback-invalid');
      const row=await env.DB.prepare('UPDATE messages SET vote=? WHERE id=? AND session=? AND expires>? RETURNING id').bind(b.vote,b.id,session,now).first();
      if(!row)throw new Problem(404,'record-not-found');return json({recorded:true});
    }
    throw new Problem(404,'not-found');
  }
  async function purge(env,now){
    await env.DB.batch([
      env.DB.prepare('DELETE FROM messages WHERE expires<=?').bind(now),
      env.DB.prepare('DELETE FROM counters WHERE expires<=?').bind(now),
      env.DB.prepare('DELETE FROM deleted_sessions WHERE expires<=?').bind(now),
      env.DB.prepare('UPDATE digests SET payload=NULL WHERE created<?').bind(now-DAY),
      env.DB.prepare('DELETE FROM digests WHERE created<?').bind(now-180*DAY)
    ]);
  }
  async function digest(env,now){
    if(env.DIGEST_ENABLED!=='true'||!env.RESEND_API_KEY||!/^Iris <[a-z0-9._+-]+@(?:[a-z0-9-]+\.)*kiralabs\.org>$/.test(env.DIGEST_FROM||''))throw new Problem(503,'digest-not-configured');
    const w=weekWindow(now);
    const old=await env.DB.prepare('SELECT state FROM digests WHERE week=?').bind(w.key).first();
    if(old)return {state:old.state,duplicate_prevented:true};
    const counts=await env.DB.prepare('SELECT COUNT(*) AS messages,COUNT(DISTINCT session) AS sessions,COALESCE(SUM(CASE WHEN answered=0 THEN 1 ELSE 0 END),0) AS unanswered FROM messages WHERE created>=? AND created<? AND expires>?').bind(w.start,w.end,now).first();
    const topics=(await env.DB.prepare('SELECT topic,COUNT(*) AS n FROM messages WHERE created>=? AND created<? AND expires>? GROUP BY topic ORDER BY n DESC LIMIT 8').bind(w.start,w.end,now).all()).results;
    const unanswered=(await env.DB.prepare('SELECT question FROM messages WHERE created>=? AND created<? AND expires>? AND answered=0 GROUP BY question ORDER BY COUNT(*) DESC LIMIT 8').bind(w.start,w.end,now).all()).results;
    const feedback=(await env.DB.prepare('SELECT question,answer,vote FROM messages WHERE created>=? AND created<? AND expires>? AND vote<>0 ORDER BY created DESC LIMIT 6').bind(w.start,w.end,now).all()).results;
    const payload=JSON.stringify({from:env.DIGEST_FROM,to:[OWNER_EMAIL],subject:'Iris Weekly — week ending '+w.key,text:digestText(w,counts,topics,unanswered,feedback)});
    const claim=await env.DB.prepare("INSERT INTO digests(week,state,created,payload) VALUES(?,'sending',?,?) ON CONFLICT(week) DO NOTHING RETURNING week").bind(w.key,now,payload).first();
    if(!claim)return {duplicate_prevented:true};
    try{
      const response=await net('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'iris-weekly-'+w.key},body:payload,signal:AbortSignal.timeout(15000)});
      const receipt=await response.json();
      if(!response.ok||typeof receipt.id!=='string')throw Error('provider-not-confirmed');
      await env.DB.prepare("UPDATE digests SET state='provider-accepted',provider_id=?,payload=NULL WHERE week=?").bind(receipt.id,w.key).run();
      return {state:'provider-accepted'};
    }catch{
      // Do not make duplicate-prone retries after an uncertain external send.
      await env.DB.prepare("UPDATE digests SET state='needs-owner-review' WHERE week=?").bind(w.key).run();
      return {state:'needs-owner-review'};
    }
  }
  return {
    async fetch(request,env){
      const origin=request.headers.get('Origin'),headers=ORIGINS.has(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization'}:{};
      try{const response=await handle(request,env);for(const [k,v]of Object.entries(headers))response.headers.set(k,v);return response;}
      catch(e){return json({error:e instanceof Problem?e.message:'service-unavailable',fallback:true},e instanceof Problem?e.status:503,headers);}
    },
    async scheduled(event,env){
      if(!ready(env,kb))return;
      const now=event.scheduledTime||clock();await purge(env,now);
      if(event.cron==='0 13 * * 1')await digest(env,now);
    },
    // Direct exports enable isolated tests without a deployed account or API spend.
    _test:{digest,purge}
  };
}
