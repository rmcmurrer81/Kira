#!/usr/bin/env node
/** Run locally, never in public Actions: output can contain opted-in private text. */
import fs from 'node:fs/promises';
const [command,arg,confirm]=process.argv.slice(2);
const endpoint=process.env.IRIS_ENDPOINT,token=process.env.IRIS_OWNER_TOKEN;
if(!endpoint||!token){console.error('Set IRIS_ENDPOINT and IRIS_OWNER_TOKEN in your local environment. Never paste the token into a public file or issue.');process.exit(1);}
const u=new URL(endpoint);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw Error('Use the HTTPS Worker origin.');
let route,method='GET',body;
if(command==='review')route='/admin/review';
else if(command==='revisions')route='/admin/revisions';
else if(command==='digests')route='/admin/digests';
else if(command==='approve'&&arg&&confirm==='--confirm'){route='/admin/revisions';method='POST';body=JSON.stringify({...JSON.parse(await fs.readFile(arg,'utf8')),approve:true});}
else if(command==='rollback'&&arg&&confirm==='--confirm'){route='/admin/rollback';method='POST';body=JSON.stringify({id:arg});}
else {console.error('Commands: review | revisions | digests | approve answer.json --confirm | rollback REVISION_ID --confirm');process.exit(1);}
const response=await fetch(u.origin+route,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body});
const result=await response.json();if(!response.ok){console.error(result.error||'Request failed.');process.exit(1);}
console.log(JSON.stringify(result,null,2));
