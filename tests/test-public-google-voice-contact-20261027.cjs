'use strict';
// Public Kira Labs contact links must use the Google Voice BUSINESS number.
// Do not embed linked personal device numbers in public files or test messages.
// Run: node tests/test-public-google-voice-contact-20261027.cjs
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const expected='3175868199';
const display='(317) 586-8199';
for(const file of ['docs/contact.html','docs/sony-xr.html','docs/business/index.html','docs/investors/index.html']){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const phones=[...html.matchAll(/\b(?:\+?1)?[\s.(\-]*([2-9]\d{2})[\s.)\-]*([2-9]\d{2})[\s.\-]*(\d{4})\b/g)].map(m=>m[1]+m[2]+m[3]);
  assert.ok(phones.length>0,'No public telephone found in '+file);
  assert.ok(phones.every(p=>p===expected),'Non-Google-Voice telephone in '+file);
  const links=[...html.matchAll(/(?:href|src)="((?:tel:|sms:)[^"]+)"/g)].map(m=>m[1]);
  assert.ok(links.some(u=>u==='tel:+1'+expected),'Missing Google Voice call target '+file);
  assert.ok(links.every(u=>u==='tel:+1'+expected||u==='sms:+1'+expected),'Wrong call/text target '+file);
  assert.ok(html.includes(display),'Missing public Google Voice display in '+file);
  if(file==='docs/contact.html'){
    assert.ok(html.includes('sms:+1'+expected),'Missing Google Voice text action');
    assert.ok(html.includes('Google Voice'),'Missing phone type label');
  }
}
console.log('Public site contact-number regression passed: Google Voice only in all four contact locations.');
