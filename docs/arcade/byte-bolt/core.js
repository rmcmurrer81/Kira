/* Pure game logic, shared by the browser and Node tests. No eval or network. */
(function(root){
'use strict';
const items={sensor:{name:'HC-SR04 distance sensor',price:15},led:{name:'LED + 220 Ω resistor',price:10}};
const fresh=()=>({version:1,coins:20,inventory:[],repair:false,light:false,accepted:false,x:0,z:5});
function validate(s){
 if(!s||s.version!==1||!Number.isSafeInteger(s.coins)||s.coins<0||!Array.isArray(s.inventory)||s.inventory.some(i=>typeof i!=='string'||!Object.hasOwn(items,i))||new Set(s.inventory).size!==s.inventory.length||['repair','light','accepted'].some(k=>typeof s[k]!=='boolean')||!Number.isFinite(s.x)||!Number.isFinite(s.z)||Math.abs(s.x)>10||Math.abs(s.z)>10||s.light&&!s.repair||s.repair&&!s.accepted||s.repair&&!s.inventory.includes('sensor')||s.light&&!s.inventory.includes('led'))throw Error('This is not a valid town save. Your current game was kept.');
 return {version:1,coins:s.coins,inventory:[...s.inventory],repair:s.repair,light:s.light,accepted:s.accepted,x:s.x,z:s.z};
}
function buy(s,id){if(typeof id!=='string'||!Object.hasOwn(items,id))throw Error('Unknown part');if(id==='led'&&!s.repair)throw Error('Finish the robot repair to unlock this shelf.');if(s.inventory.includes(id))throw Error('You already own this part.');if(s.coins<items[id].price)throw Error('Not enough game credits.');s.coins-=items[id].price;s.inventory.push(id);return s;}
// Evaluate a small, real JavaScript expression grammar. Never execute arbitrary code.
function compile(source){
 if(typeof source!=="string"||source.length>1000)throw Error("Keep the function body under 1,000 characters.");
 let clean=source.trim().replace(/;\s*$/,'');if(!/^return\s+/.test(clean))throw Error('Start with return, then a comparison.');clean=clean.replace(/^return\s+/,'');
 const tokens=clean.match(/distanceCm|true|false|undefined|===|!==|<=|>=|&&|\|\||[()<>]|\d+(?:\.\d+)?/g)||[];
 if(tokens.join('')!==clean.replace(/\s/g,''))throw Error('Use distanceCm, numbers, undefined, comparisons, &&, || and parentheses.');
 let p=0;
 function atom(){let t=tokens[p++];if(t==='('){let e=or();if(tokens[p++]!==')')throw Error('Close the parenthesis.');return e;}if(t==='distanceCm')return d=>d;if(t==='undefined')return ()=>undefined;if(t==='true'||t==='false')return ()=>t==='true';if(t&&/^\d/.test(t))return ()=>Number(t);throw Error('Expected a value.');}
 function compare(){let a=atom();if(['<','>','<=','>=','===','!=='].includes(tokens[p])){let op=tokens[p++],b=atom(),left=a;return d=>{let x=left(d),y=b(d);return op==='<'?x<y:op==='>'?x>y:op==='<='?x<=y:op==='>='?x>=y:op==='==='?x===y:x!==y;};}return a;}
 function and(){let a=compare();while(tokens[p]==='&&'){p++;let left=a,b=compare();a=d=>left(d)&&b(d);}return a;}
 function or(){let a=and();while(tokens[p]==='||'){p++;let left=a,b=and();a=d=>left(d)||b(d);}return a;}
 let result=or();if(p!==tokens.length)throw Error('Check the comparison syntax.');return result;
}
const cases=[{d:undefined,want:true,label:'No echo (undefined)'},{d:0,want:true,label:'0 cm'},{d:19,want:true,label:'19 cm'},{d:20,want:false,label:'20 cm'},{d:45,want:false,label:'45 cm'}];
function testCode(code){let fn=compile(code);return cases.map(c=>({...c,actual:fn(c.d),pass:fn(c.d)===c.want}));}
function repair(s,code){if(!s.accepted)throw Error('Talk to Iris to accept the job.');if(!s.inventory.includes('sensor'))throw Error('Buy a replacement sensor first.');let r=testCode(code);if(r.some(c=>!c.pass))throw Error('Some tests failed. Use the tablet and try again.');if(!s.repair){if(s.coins>Number.MAX_SAFE_INTEGER-45)throw Error('Imported credit balance is too large to award credits safely.');s.repair=true;s.coins+=45;}return r;}
function light(s,resistance){if(!s.repair||!s.inventory.includes('led'))throw Error('Finish the repair and buy the LED kit.');if(Number(resistance)!==220)throw Error('We calculated 200 Ω minimum. Choose the next available value, 220 Ω.');if(!s.light){if(s.coins>Number.MAX_SAFE_INTEGER-25)throw Error('Imported credit balance is too large to award credits safely.');s.light=true;s.coins+=25;}return s;}
const api={items,fresh,validate,buy,compile,testCode,repair,light};root.TownCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
