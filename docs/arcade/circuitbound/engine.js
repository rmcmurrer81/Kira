/* A deterministic teaching engine. Learner text is compared, never executed. */
(function (root) {
  'use strict';
  const VERSION = 1;
  const scenes = root.CircuitboundStory;
  if (!Array.isArray(scenes)) throw new Error('Load story.js before engine.js');
  const byId = Object.assign(Object.create(null), Object.fromEntries(scenes.map(scene => [scene.id, scene])));
  const booleanFlags = ['rescued','map','ruthless','morrow','spareCell','refugees','hurried','truth','lens','trustedPix','deceived','rejectedShard','shard','cracked','backup','evacuated'];
  const codeTargets = {
    rune: 'const rune = "dawn"; openDoor(rune);',
    water: 'const waterHigh = true; if (waterHigh) { openSluice(); }',
    array: 'const order = [1, 2, 3]; sendSignal(order);',
    loop: 'for (let i = 0; i < 3; i++) { placeSegment(); }',
    servo: 'const angle = 90; setServo(angle);',
    and: 'const authorized = true; const powerReady = true; if (authorized && powerReady) { raiseWard(); }'
  };
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function createState() {
    return { version: VERSION, sceneId: 'arrival', revision: 0, flags: {}, light: 3, trust: 0, solved: false, feedback: null, attempts: {}, visited: ['arrival'], journal: [], completed: [] };
  }
  function getScene(state) { return (state && byId[state.sceneId]) || byId.arrival; }
  function tokens(source) {
    // Only this small teaching grammar is accepted. There is no eval or Function.
    if (typeof source !== 'string' || source.length > 4000) return null;
    const result = [];
    let at = 0;
    while (at < source.length) {
      const rest = source.slice(at);
      let match;
      if ((match = /^\s+/.exec(rest))) { at += match[0].length; continue; }
      if (rest.startsWith('//')) { const end = rest.indexOf('\n'); at += end < 0 ? rest.length : end; continue; }
      if (rest.startsWith('/*')) { const end = rest.indexOf('*/', 2); if (end < 0) return null; at += end + 2; continue; }
      if ((match = /^(?:"[^"\\\r\n]*"|'[^'\\\r\n]*')/.exec(rest))) {
        result.push('text:' + match[0].slice(1, -1)); at += match[0].length; continue;
      }
      if ((match = /^(?:[A-Za-z_$][\w$]*|\d+|&&|\|\||\+\+|<=|>=|===|==|[=;(),{}\[\]<>+\-])/.exec(rest))) {
        result.push(match[0]); at += match[0].length; continue;
      }
      return null;
    }
    // The final semicolon is optional; internal semicolons remain structural.
    if (result[result.length - 1] === ';') result.pop();
    return result;
  }
  function validateCode(id, source) {
    const scene = byId[id];
    const validator = scene && scene.code ? scene.code.validator : id;
    const expected = codeTargets[validator];
    if (typeof expected !== 'string') return false;
    const actualTokens = tokens(source);
    return actualTokens !== null && JSON.stringify(actualTokens) === JSON.stringify(tokens(expected));
  }
  function feedback(kind, text) { return {kind, text}; }
  function applyEffects(state, effects) {
    for (const [key, value] of Object.entries(effects || {})) {
      if (key === 'light') state.light = Math.max(0, Math.min(5, state.light + value));
      else if (key === 'trust') state.trust = Math.max(-5, Math.min(10, state.trust + value));
      else if (booleanFlags.includes(key) && typeof value === 'boolean') state.flags[key] = value;
    }
  }
  function move(state, to) {
    if (!byId[to]) throw new Error('Unknown scene: ' + to);
    const previous = state.sceneId;
    state.sceneId = to;
    state.solved = false;
    state.feedback = null;
    state.revision += 1;
    if (!state.visited.includes(to)) state.visited.push(to);
    state.journal.push({ from: previous, to });
  }
  function conditionsMatch(flags, when) {
    return Object.entries(when).every(([key, value]) => Boolean(flags[key]) === value);
  }
  function result(state, ok, message, changed) { return {state, ok, feedback: message, changed}; }
  function act(input, action) {
    let state;
    try { state = copy(input); }
    catch (_) { return result(createState(), false, feedback('error', 'The saved adventure was invalid. A new story has been started.'), true); }
    if (!validateState(state)) return result(createState(), false, feedback('error', 'The saved adventure was invalid. A new story has been started.'), true);
    if (!action || typeof action !== 'object') return result(state, false, feedback('error', 'Choose an action first.'), false);
    if (action.sceneId !== state.sceneId || (action.revision !== undefined && action.revision !== state.revision)) {
      return result(state, false, feedback('info', 'That action belonged to an earlier moment. Choose from the current scene.'), false);
    }
    const scene = getScene(state);
    if (action.type === 'hint') {
      const text = scene.code ? scene.code.hint : scene.hint;
      if (!text || state.solved) return result(state, false, state.feedback, false);
      state.feedback = feedback('hint', text);
      return result(state, true, state.feedback, true);
    }
    if (action.type === 'choice') {
      if (scene.kind !== 'choice' || scene.ending) return result(state, false, state.feedback, false);
      if (!Number.isInteger(action.index) || !scene.choices[action.index]) return result(state, false, feedback('error', 'Choose one of the available paths.'), false);
      const choice = scene.choices[action.index];
      applyEffects(state, choice.effects);
      const route = (choice.routes || []).find(item => conditionsMatch(state.flags, item.when));
      move(state, route ? route.to : choice.to);
      return result(state, true, null, true);
    }
    if (action.type === 'continue') {
      if (!state.solved || !scene.next) return result(state, false, feedback('info', 'Solve this console before continuing.'), false);
      move(state, scene.next);
      return result(state, true, null, true);
    }
    if (action.type === 'submit') {
      if (scene.kind === 'choice' || state.solved) return result(state, false, state.feedback, false);
      let correct;
      if (scene.kind === 'code') correct = validateCode(scene.id, action.value);
      else correct = typeof action.value === 'string' && action.value === scene.solution;
      if (correct) {
        state.solved = true;
        if (!state.completed.includes(scene.id)) state.completed.push(scene.id);
        state.feedback = feedback('success', scene.code ? scene.code.explain : scene.explain);
        return result(state, true, state.feedback, true);
      }
      state.attempts[scene.id] = (state.attempts[scene.id] || 0) + 1;
      if (state.attempts[scene.id] === 1) state.light = Math.max(0, state.light - 1);
      const tip = scene.kind === 'code' ? 'Check the exact names, values and punctuation. The lesson and Hint explain the pattern.' : 'Match the requirement to the device. Check the capacity target or the physical quantity you need to measure.';
      state.feedback = feedback('error', (scene.wrong || 'The console stays closed. ' + tip) + ' You can retry as often as you need.');
      return result(state, false, state.feedback, true);
    }
    return result(state, false, feedback('error', 'Unknown action.'), false);
  }
  function validateState(state) {
    if (!state || typeof state !== 'object' || Array.isArray(state) || state.version !== VERSION || !byId[state.sceneId]) return false;
    if (!Number.isInteger(state.revision) || state.revision < 0 || state.revision > 100000) return false;
    if (!state.flags || typeof state.flags !== 'object' || Array.isArray(state.flags)) return false;
    if (Object.entries(state.flags).some(([key,value]) => !booleanFlags.includes(key) || typeof value !== 'boolean')) return false;
    if (!Number.isInteger(state.light) || state.light < 0 || state.light > 5 || !Number.isInteger(state.trust) || state.trust < -5 || state.trust > 10 || typeof state.solved !== 'boolean') return false;
    if (!Array.isArray(state.visited) || state.visited.length > scenes.length || state.visited.some(id => !byId[id]) || !state.visited.includes(state.sceneId)) return false;
    if (!Array.isArray(state.completed) || state.completed.length > scenes.length || state.completed.some(id => !byId[id] || byId[id].kind === 'choice')) return false;
    if (!state.attempts || typeof state.attempts !== 'object' || Array.isArray(state.attempts) || Object.entries(state.attempts).some(([id,count]) => !byId[id] || byId[id].kind === 'choice' || !Number.isInteger(count) || count < 1 || count > 100000)) return false;
    if (!Array.isArray(state.journal) || state.journal.length > 100000 || state.journal.some(item => !item || !byId[item.from] || !byId[item.to])) return false;
    if (state.solved && (byId[state.sceneId].kind === 'choice' || !state.completed.includes(state.sceneId))) return false;
    if (state.feedback !== null && (!state.feedback || !['success','error','hint','info'].includes(state.feedback.kind) || typeof state.feedback.text !== 'string' || state.feedback.text.length > 2000)) return false;
    return true;
  }
  function serialize(state) {
    if (!validateState(state)) throw new Error('Cannot save invalid adventure');
    return JSON.stringify(state);
  }
  function restore(json) {
    try { const state = JSON.parse(json); return validateState(state) ? {state,ok:true} : {state:createState(),ok:false}; }
    catch (_) { return {state:createState(),ok:false}; }
  }
  root.Circuitbound = Object.freeze({ VERSION, createState, getScene, act, validateCode, validateState, serialize, restore, scenes });
})(typeof window !== 'undefined' ? window : globalThis);
