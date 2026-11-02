/* Code Quest: deliberately disposable worker for player-entered JavaScript.
 * The main website never evals player input, the worker has no access to DOM,
 * and the parent terminates each worker after completion or a short timeout.
 * No network calls, accounts or remote evaluators are used by the game.
 */
"use strict";
const blocked=()=>{throw new Error("Network access is not part of this coding adventure.");};
self.fetch=blocked;
self.XMLHttpRequest=undefined;
self.WebSocket=undefined;
self.EventSource=undefined;
self.importScripts=blocked;
self.onmessage=(event)=>{
  const code=event.data && event.data.code;
  if(typeof code!=="string" || code.length>6000){
    self.postMessage({ok:false,error:"Please enter a program under 6,000 characters."});return;
  }
  const actions=[];
  const log=(type,value)=>{
    if(actions.length>=64)throw new Error("PIX received too many commands. Try a shorter loop.");
    actions.push({type,value});
  };
  const say=value=>{
    if(typeof value!=="string" || value.length>150)throw new Error('say() needs a short message in quotation marks, like say("Hello!");');
    log("say",value);
  };
  const charge=value=>{
    if(typeof value!=="number" || !Number.isFinite(value) || value<0 || value>100)throw new Error("charge() needs a number between 0 and 100.");
    log("charge",value);
  };
  const move=value=>{
    if(!Number.isInteger(value) || value<1 || value>20)throw new Error("move() needs a whole number of steps from 1 to 20.");
    log("move",value);
  };
  const turn=value=>{
    if(value!=="left"&&value!=="right")throw new Error('turn() accepts only "left" or "right" inside quotes.');
    log("turn",value);
  };
  const openGate=()=>log("openGate",null);
  const collect=value=>{
    if(!Number.isInteger(value)||value<1||value>20)throw new Error("collect() needs a star number between 1 and 20.");
    log("collect",value);
  };
  try{
    // Intentionally runs only locally supplied player code in this worker, not
    // in the page. The surrounding page inspects the emitted commands.
    const program=new Function("say","charge","move","turn","openGate","collect",'"use strict";\n'+code);
    program(say,charge,move,turn,openGate,collect);
    self.postMessage({ok:true,actions});
  }catch(error){
    const message=error && error.message?String(error.message):"The program stopped.";
    self.postMessage({ok:false,error:message.slice(0,260)});
  }
};