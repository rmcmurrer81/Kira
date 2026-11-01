/* Iris voice presentation only. Keep the pinned guide/knowledge engine unchanged.
 * Browser-provided speech: no Kira Labs audio API, upload, microphone, or paid key.
 * The visitor opts in to speaking each visit; only a voice preference is stored.
 */
(() => {
  'use strict';
  const get = id => document.getElementById(id);
  const toggle = get('voice-toggle'), status = get('voice-status');
  const header = document.querySelector('.kb-contact-iris-card .guide-head');
  const title = get('answer-title'), body = get('answer-body');
  const question = get('asked-question'), page = get('answer-page');
  const clear = get('clear-chat');
  if (!toggle || !status || !header || !title || !body || !question || !page) return;

  const synth = window.speechSynthesis;
  const Utterance = window.SpeechSynthesisUtterance;
  const supported = Boolean(synth && Utterance && typeof synth.speak === 'function');
  const STORAGE_KEY = 'kira-iris-preferred-voice-v1';
  const softNames = /\b(?:ava|jenny|aria|emma|sonia|samantha|zira|hazel|susan|clara|sophie|olivia|amy|serena|victoria|karen|moira|tessa|allison|jessa|salli|joanna|ivy|natalie|kendra|kimberly|courtney|fiona|kate|alice|ellie)\b/i;
  const leadingNames = /\b(?:ava|jenny|emma|aria|sonia)\b/i;
  const naturalNames = /\b(?:natural|neural|premium|enhanced)\b/i;
  let voices = [], enabled = false, preferred = 'auto', sequence = 0;
  let lastReply = '', readTimer = null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored.length < 500) preferred = stored;
  } catch (_) { /* Visitors can use voice without local storage. */ }

  const row = document.createElement('div');
  row.className = 'iris-voice-picker';
  const label = document.createElement('label');
  label.htmlFor = 'iris-voice-choice';
  label.textContent = 'Iris voice';
  const select = document.createElement('select');
  select.id = 'iris-voice-choice';
  select.setAttribute('aria-label','Choose Iris speech voice');
  const preview = document.createElement('button');
  preview.type = 'button';
  preview.id = 'iris-voice-preview';
  preview.textContent = 'Preview';
  preview.setAttribute('aria-label','Hear a sample of the selected Iris voice');
  const note = document.createElement('small');
  note.className = 'iris-voice-note';
  note.id = 'iris-voice-note';
  note.textContent = 'Softer pace. Voices depend on your browser; some use online services.';
  row.append(label, select, preview, note);
  header.insertAdjacentElement('afterend',row);

  function voiceKey(voice) {
    return JSON.stringify([voice.name, voice.lang, voice.voiceURI || '']);
  }
  function isEnglish(voice) { return /^en(?:-|_|$)/i.test(voice.lang || ''); }
  function voiceScore(voice) {
    const name = voice.name || '';
    let value = leadingNames.test(name) ? 140 : softNames.test(name) ? 95 : 0;
    if (naturalNames.test(name)) value += 75;
    if (/^en[-_]US$/i.test(voice.lang)) value += 12;
    else if (/^en[-_]GB$/i.test(voice.lang)) value += 8;
    if (voice.default) value += 3;
    return value;
  }
  function chosenVoice() {
    const picked = voices.find(voice => voiceKey(voice) === preferred);
    if (picked) return picked;
    return voices.length ? voices.slice().sort((a,b) => voiceScore(b)-voiceScore(a))[0] : null;
  }
  function serviceLabel(voice) {
    if (voice.localService === false) return 'online/browser-provided';
    if (voice.localService === true) return 'on-device';
    return 'browser-provided';
  }
  function describeVoice() {
    const v = chosenVoice();
    return v ? v.name + ' · ' + serviceLabel(v) : 'browser default';
  }
  function refreshChoices() {
    if (!supported) return;
    const available = Array.from(synth.getVoices() || []);
    voices = available.filter(isEnglish);
    voices.sort((a,b) => voiceScore(b)-voiceScore(a) || a.name.localeCompare(b.name));
    const old = preferred;
    const automatic = document.createElement('option');
    automatic.value = 'auto';
    automatic.textContent = 'Soft female (automatic)';
    select.replaceChildren(automatic);
    const suggested = document.createElement('optgroup');
    suggested.label = 'Suggested softer voices';
    const other = document.createElement('optgroup');
    other.label = 'Other English voices';
    for (const voice of voices) {
      const option = document.createElement('option');
      option.value = voiceKey(voice);
      option.textContent = voice.name + ' (' + voice.lang + '; ' + serviceLabel(voice) + ')';
      (softNames.test(voice.name) ? suggested : other).appendChild(option);
    }
    if (suggested.children.length) select.appendChild(suggested);
    if (other.children.length) select.appendChild(other);
    // Keep a remembered choice when voices are temporarily unavailable.
    select.value = old !== 'auto' && voices.some(v=>voiceKey(v)===old) ? old : 'auto';
    note.textContent = 'Using ' + describeVoice() +
      '. Browser voices vary; online voices may send spoken text to the browser provider.';
  }
  function display(message) {
    toggle.textContent = enabled ? 'Voice off' : 'Voice on';
    toggle.setAttribute('aria-pressed',String(enabled));
    status.textContent = message || (enabled
      ? 'Iris voice on · reads each new reply'
      : 'Voice off · preview a voice or turn reading on');
  }
  function stop() {
    sequence += 1;
    if (readTimer !== null) { clearTimeout(readTimer); readTimer = null; }
    if (supported) synth.cancel();
  }
  // Short utterances avoid the long-speech cutoff seen in some browser engines.
  function chunksOf(text) {
    const sentences = String(text).replace(/\s+/g,' ').trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    const chunks = [];
    let current = '';
    function pushPart(part) {
      const words = part.trim().split(/\s+/);
      for (const word of words) {
        if (!word) continue;
        if (current && current.length + word.length + 1 > 190) {
          chunks.push(current);
          current = '';
        }
        current += (current ? ' ' : '') + word;
      }
    }
    for (const sentence of sentences) {
      if (current && current.length + sentence.length + 1 > 190) {
        chunks.push(current);
        current = '';
      }
      pushPart(sentence);
    }
    if (current) chunks.push(current);
    return chunks;
  }
  function speak(text, isPreview) {
    if (!supported) { display('Your browser does not offer speech synthesis.'); return; }
    stop();
    const token = sequence;
    const pieces = chunksOf(text);
    const selected = chosenVoice();
    let part = 0;
    if (!pieces.length) return;
    function next() {
      if (token !== sequence || (!enabled && !isPreview)) return;
      if (part >= pieces.length) {
        display(isPreview ? 'Voice preview finished · ' + describeVoice() : undefined);
        return;
      }
      const utterance = new Utterance(pieces[part++]);
      if (selected) utterance.voice = selected;
      utterance.lang = selected ? selected.lang : 'en-US';
      utterance.rate = 0.89;
      utterance.pitch = 1.06;
      utterance.volume = 0.94;
      utterance.onstart = () => {
        if (token === sequence) display(isPreview ? 'Previewing ' + describeVoice() : 'Iris is speaking · soft, gentle pace');
      };
      utterance.onend = next;
      utterance.onerror = event => {
        if (token !== sequence || event.error === 'interrupted' || event.error === 'canceled') return;
        if (!isPreview) enabled = false;
        display('Speech could not play. Try Preview or choose another available voice.');
      };
      try { synth.speak(utterance); }
      catch (_) {
        if (token === sequence) display('Voice could not start. Try another browser voice.');
      }
    }
    next();
  }
  function currentReply() {
    const q = question.textContent.trim();
    const subject = title.textContent.trim();
    const answer = body.textContent.trim();
    if (!q || question.hidden || q.toLowerCase() === 'hello' ||
        !answer || subject === 'What would you like to know?') return null;
    const key = [page.textContent.trim(),q,subject,answer].join('\u001f');
    return {key,text:subject + '. ' + answer};
  }
  function readCurrent(force) {
    if (!enabled) return;
    const current = currentReply();
    if (!current) { display(); return; }
    if (!force && current.key === lastReply) return;
    lastReply = current.key;
    speak(current.text,false);
  }
  function scheduleRead() {
    if (!enabled) return;
    if (readTimer !== null) clearTimeout(readTimer);
    readTimer = setTimeout(() => {
      readTimer = null;
      readCurrent(false);
    },100);
  }

  if (!supported) {
    select.disabled = true;
    preview.disabled = true;
    toggle.disabled = true;
    display('Speech is unavailable in this browser. The text chat still works.');
    return;
  }
  refreshChoices();
  if (typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged',refreshChoices);
  }
  // Capture the existing voice button before the legacy engine's click handler.
  // Its frozen internal voice flag stays off; all speech uses this optional layer.
  toggle.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    enabled = !enabled;
    if (!enabled) { stop(); display(); return; }
    lastReply = '';
    display('Voice on · ' + describeVoice());
    readCurrent(true);
  },true);
  select.addEventListener('change', () => {
    preferred = select.value;
    try { window.localStorage.setItem(STORAGE_KEY,preferred); } catch (_) {}
    refreshChoices();
    if (enabled) {
      lastReply = '';
      readCurrent(true);
    } else display('Selected ' + describeVoice() + ' · select Preview to listen.');
  });
  preview.addEventListener('click',() => {
    speak("Hello. I'm Iris, your Kira Labs guide. I'm happy to help you explore the research.",true);
  });
  clear?.addEventListener('click', () => {
    stop();
    lastReply = '';
    if (enabled) display('Voice on · ready for a new question');
  },true);
  // Observe only the original answer fields; never modify knowledge or replies.
  const observer = new MutationObserver(scheduleRead);
  for (const element of [title,body,page,question]) {
    observer.observe(element,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});
  }
  addEventListener('pagehide',() => { enabled = false; stop(); });
  display();
})();