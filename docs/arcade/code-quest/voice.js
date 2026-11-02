/* Optional Code Quest narration using Iris's existing browser voice approach.
 * Keep the fixed priorities and speech settings in sync with ../../iris-voice.js.
 * Voice availability is controlled by the device; this is not a hosted Iris recording.
 * Loading the page never enables speech. Only the voice/replay buttons do that.
 */
(() => {
  'use strict';
  const priorities = [
    /\bJenny\b.*\bNatural\b/i,
    /\bAva\b.*\bNatural\b/i,
    /\bEmma\b.*\bNatural\b/i,
    /\bSonia\b.*\bNatural\b/i,
    /\bAria\b.*\bNatural\b/i,
    /\bSamantha\b/i,
    /\bZira\b/i,
    /\bHazel\b/i,
    /\bSusan\b/i,
    /\bKaren\b/i,
    /\bMoira\b/i,
    /\bAllison\b/i
  ];
  function partsOf(text) {
    const units = text.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    const result = [];
    let part = '';
    for (const sentence of units) {
      for (const word of sentence.trim().split(/\s+/)) {
        if (!word) continue;
        if (part && part.length + word.length + 1 > 210) { result.push(part); part = ''; }
        part += (part ? ' ' : '') + word;
      }
    }
    if (part) result.push(part);
    return result;
  }
  function init({toggle, replay, status} = {}) {
    const synth = window.speechSynthesis;
    const Utterance = window.SpeechSynthesisUtterance;
    const supported = Boolean(toggle && replay && status && synth && Utterance && typeof synth.speak === 'function');
    let enabled = false, token = 0, latest = '', speaking = false;
    function chooseVoice() {
      if (!supported) return null;
      let voices = [];
      try { voices = Array.from(synth.getVoices() || []).filter(v => /^en(?:-|_|$)/i.test(v.lang || '')); }
      catch (_) { /* Some browsers expose the voice list only after a gesture. */ }
      for (const pattern of priorities) {
        const found = voices.find(v => pattern.test(v.name || ''));
        if (found) return found;
      }
      return voices.find(v => v.default) || voices[0] || null;
    }
    function updateStatus(message) {
      if (toggle) {
        toggle.textContent = enabled ? 'Voice off' : 'Voice on';
        toggle.setAttribute('aria-pressed', String(enabled));
      }
      if (status) status.textContent = message || (enabled
        ? 'Iris voice approach on. Reads each new scene; the voice depends on your device.'
        : 'Voice off. Read at your own pace, or turn on Iris-style narration.');
    }
    function stop() {
      token++;
      speaking = false;
      if (supported) { try { synth.cancel(); } catch (_) { /* Text play remains available. */ } }
    }
    function unavailable() {
      enabled = false;
      stop();
      updateStatus('Speech is unavailable. Your adventure and all its text still work.');
    }
    function speak() {
      stop();
      if (!supported || !enabled || !latest) { updateStatus(); return; }
      const current = token, chunks = partsOf(latest);
      let chosen = chooseVoice(), index = 0;
      function next() {
        if (current !== token || !enabled) return;
        if (index >= chunks.length) { speaking = false; updateStatus(); return; }
        try {
          const utterance = new Utterance(chunks[index++]);
          // A delayed device voice list can become available between chunks.
          if (!chosen) chosen = chooseVoice();
          if (chosen) utterance.voice = chosen;
          utterance.lang = chosen?.lang || 'en-US';
          utterance.rate = 0.96;
          utterance.pitch = 1;
          utterance.volume = 1;
          utterance.onstart = () => {
            if (current !== token) return;
            speaking = true;
            updateStatus('Narration is speaking. Voice off stops it; Replay reads this scene again.');
          };
          utterance.onend = next;
          utterance.onerror = event => {
            if (current !== token || event.error === 'canceled' || event.error === 'interrupted') return;
            unavailable();
          };
          synth.speak(utterance);
        } catch (_) { if (current === token) unavailable(); }
      }
      next();
    }
    function read(text) {
      if (typeof text !== 'string') return;
      latest = text.trim();
      if (enabled) speak();
    }
    if (!supported) {
      if (toggle) toggle.disabled = true;
      if (replay) replay.disabled = true;
      updateStatus('Speech is unavailable in this browser. Your adventure and all its text still work.');
      return {read, stop, isEnabled: () => false};
    }
    toggle.addEventListener('click', () => {
      enabled = !enabled;
      if (enabled) speak();
      else { stop(); updateStatus(); }
    });
    replay.addEventListener('click', () => {
      enabled = true;
      speak();
    });
    synth.addEventListener?.('voiceschanged', () => {
      // A browser loading voices must never start speech on its own.
      if (!speaking) updateStatus();
    });
    window.addEventListener('pagehide', () => {
      enabled = false;
      stop();
      updateStatus();
    });
    updateStatus();
    return {read, stop, isEnabled: () => enabled};
  }
  window.CodeQuestVoice = Object.freeze({init});
})();
