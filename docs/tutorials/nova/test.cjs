// Run with Node: node test.cjs. No packages or network are needed.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
class Element {
  constructor(tag='div') { this.tagName=tag;this.children=[];this.handlers={};this.attributes={};this.hidden=false;this.value='';this.textContent='';this.scrollHeight=100; }
  append(...items){this.children.push(...items);}
  replaceChildren(...items){this.children=items;}
  setAttribute(k,v){this.attributes[k]=v;}
  addEventListener(k,f){this.handlers[k]=f;}
  focus(){this.focused=true;}
  fire(k,e={}){this.handlers[k]?.(e);}
  set innerHTML(v){throw Error('Unsafe innerHTML must never be used');}
}
const ids=['nova-launcher','nova-panel','nova-title','nova-log','nova-question','nova-close','nova-clear','nova-form'];
const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));elements['nova-panel'].hidden=true;
const context=vm.createContext({document:{getElementById:id=>elements[id],createElement:tag=>new Element(tag)}});
vm.runInContext(script,context);
let checks=0;function check(name,fn){fn();checks++;console.log('PASS '+name);}
const ask=q=>vm.runInContext('answerQuestion('+JSON.stringify(q)+')',context);
check('empty and whitespace ignored',()=>{assert.equal(ask('  '),null);assert.equal(ask(''),null);});
check('NewBrain experimental wording and source',()=>{assert.match(ask('What is NEWBRAIN?').text,/experimental/);assert.equal(ask('new brain').source,'newbrain');});
check('contact is not a sent message',()=>{assert.match(ask('contact').text,/does not send/);assert.equal(ask('email').source,'contact');});
check('Kira Labs fact',()=>assert.equal(ask('What is Kira Labs?').source,'home'));
check('unknown fallback and no accidental hi substring',()=>{assert.match(ask('this is a mystery').text,/cannot answer/);assert.match(ask('medical advice').text,/cannot answer/);});
check('greeting is whole phrase',()=>assert.match(ask('hello!').text,/Hello/));
check('one welcome, named launcher and title',()=>{assert.equal(elements['nova-log'].children.length,1);assert.equal(elements['nova-launcher'].textContent,'Ask Nova');assert.match(elements['nova-title'].textContent,/Nova/);});
check('open updates hidden, expanded and input focus',()=>{elements['nova-launcher'].fire('click');assert.equal(elements['nova-panel'].hidden,false);assert.equal(elements['nova-launcher'].attributes['aria-expanded'],'true');assert.equal(elements['nova-question'].focused,true);});
function submit(value){elements['nova-question'].value=value;let prevented=false;elements['nova-form'].fire('submit',{preventDefault(){prevented=true;}});assert.equal(prevented,true);}
check('empty submit adds nothing',()=>{submit(' ');assert.equal(elements['nova-log'].children.length,1);});
check('submit adds question and sourced answer then clears input',()=>{submit('NewBrain');assert.equal(elements['nova-log'].children.length,3);assert.equal(elements['nova-question'].value,'');const link=elements['nova-log'].children[2].children[2];assert.equal(link.href,'https://kiralabs.org/newbrain.html');assert.equal(link.rel,'noopener noreferrer');});
check('HTML-looking input remains inert text',()=>{const payload='<img src=x onerror=alert(1)>';submit(payload);assert.equal(elements['nova-log'].children.at(-2).children[1].textContent,payload);assert.equal(elements['nova-log'].children.at(-2).children.length,2);});
check('limit enforced even if DOM maxlength bypassed',()=>{submit('x'.repeat(1000));assert.equal(elements['nova-log'].children.at(-2).children[1].textContent.length,240);});
check('untrusted source URL creates no link',()=>{vm.runInContext("addMessage('test','Nova','https://evil.invalid')",context);assert.equal(elements['nova-log'].children.at(-1).children.length,2);});
check('prototype source name creates no link',()=>{vm.runInContext("addMessage('test','Nova','__proto__')",context);assert.equal(elements['nova-log'].children.at(-1).children.length,2);});
check('clear resets to one welcome and empty input',()=>{elements['nova-clear'].fire('click');assert.equal(elements['nova-log'].children.length,1);assert.equal(elements['nova-question'].value,'');});
check('Escape closes and focuses launcher',()=>{elements['nova-panel'].fire('keydown',{key:'Escape'});assert.equal(elements['nova-panel'].hidden,true);assert.equal(elements['nova-launcher'].focused,true);});
check('close button closes',()=>{elements['nova-launcher'].fire('click');elements['nova-close'].fire('click');assert.equal(elements['nova-panel'].hidden,true);});
check('no network, storage, eval or external resources in application',()=>{assert.doesNotMatch(script,/\b(fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|eval)\s*[.(]/);assert.doesNotMatch(html,/<(?:script|link|img)[^>]+(?:src|href)\s*=/i);});
console.log(`${checks} checks passed. DOM mocks are not real-browser visual or accessibility tests.`);
