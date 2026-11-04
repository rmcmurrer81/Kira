/* Browser controller: engine owns rules; this file owns the screen and voice. */
(() => {
  'use strict';
  const E = window.Circuitbound;
  const $ = id => document.getElementById(id);
  const storageKey = 'kira-circuitbound-lantern-siege-v1';
  const art = window.CircuitboundArt.create($('world'));
  let state = E.createState();
  let started = false;
  let muted = false;
  let busy = false;
  let voiceTicket = 0;
  let utterance;
  let startTimer;
  let currentAudio;
  let lastSpeech = '';
  let feedback = null;
  const synth = window.speechSynthesis;
  const femalePriority = [
    'Jenny Natural', 'Ava Natural', 'Emma Natural', 'Sonia Natural',
    'Aria Natural', 'Samantha', 'Zira', 'Jenny', 'Aria', 'Sonia'
  ];

  function stopVoice() {
    voiceTicket += 1;
    clearTimeout(startTimer);
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if (synth) synth.cancel();
    utterance = null;
  }

  function preferredVoice() {
    const voices = synth ? synth.getVoices() : [];
    for (const name of femalePriority) {
      const found = voices.find(v => v.name.includes(name) && /^en/i.test(v.lang));
      if (found) return found;
    }
    return voices.find(v => /^en/i.test(v.lang) && /female|hazel|susan|aria/i.test(v.name));
  }

  function speak(text, sceneAudio = false) {
    stopVoice();
    lastSpeech = text.replace(/\bPIX\b/g, 'Pix');
    if (!started || muted) return;
    const ticket = voiceTicket;
    const scene = E.getScene(state);
    const asset = sceneAudio && window.CircuitboundVoice?.[scene.id];
    $('voice-status').textContent = 'Starting narration…';
    if (asset) {
      currentAudio = new Audio(asset);
      currentAudio.onended = () => {
        if (ticket === voiceTicket) $('voice-status').textContent = 'Narration complete';
      };
      currentAudio.onerror = () => {
        if (ticket === voiceTicket) $('voice-status').textContent = 'Audio unavailable. Read the story or Replay.';
      };
      currentAudio.play().then(() => {
        if (ticket === voiceTicket) $('voice-status').textContent = 'Sarah · local game-master narration';
      }).catch(() => {
        if (ticket === voiceTicket) $('voice-status').textContent = 'Audio blocked. Press Replay to hear it.';
      });
      return;
    }
    if (!synth || !window.SpeechSynthesisUtterance) {
      $('voice-status').textContent = 'Voice unsupported here. Story text is complete.';
      return;
    }
    utterance = new SpeechSynthesisUtterance(lastSpeech);
    const voice = preferredVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = 'en-US';
    utterance.rate = 0.94;
    utterance.pitch = 1.03;
    utterance.onstart = () => {
      if (ticket !== voiceTicket) return;
      clearTimeout(startTimer);
      $('voice-status').textContent = voice ? voice.name : 'Device voice · female voice unavailable';
    };
    utterance.onend = () => {
      if (ticket === voiceTicket) $('voice-status').textContent = 'Narration complete';
    };
    utterance.onerror = event => {
      if (ticket !== voiceTicket || event.error === 'canceled' || event.error === 'interrupted') return;
      clearTimeout(startTimer);
      $('voice-status').textContent = 'Voice unavailable. Press Replay or read the story.';
    };
    startTimer = setTimeout(() => {
      if (ticket === voiceTicket) $('voice-status').textContent = 'No voice response. Try Replay or mute and read.';
    }, 5000);
    synth.speak(utterance);
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, E.serialize(state));
      $('save-status').textContent = 'Journey saved on this device';
    } catch (_) {
      $('save-status').textContent = 'Storage unavailable · keep this tab open';
    }
  }

  function makeChoice(label, detail, number, callback) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice';
    button.disabled = !started;
    const badge = document.createElement('span');
    badge.className = 'number';
    badge.textContent = number;
    badge.setAttribute('aria-hidden', 'true');
    const body = document.createElement('span');
    body.className = 'choice-body';
    const title = document.createElement('span');
    title.textContent = label;
    body.append(title);
    if (detail) {
      const small = document.createElement('small');
      small.textContent = detail;
      body.append(small);
    }
    button.append(badge, body);
    button.addEventListener('click', callback);
    return button;
  }

  function render({ focus = false, narrate = false } = {}) {
    const scene = E.getScene(state);
    art.setScene(scene, state); if (state.solved) art.pulse('open');
    $('game').classList.toggle('has-feedback', Boolean(feedback));
    $('location').textContent = scene.location;
    $('scene-title').textContent = scene.title;
    $('story').textContent = scene.text;
    $('objective').textContent = scene.objective;
    $('chapter').textContent = scene.location;
    $('scene-number').textContent = scene.ending ? 'YOUR CHOICES HAVE BECOME HISTORY' : 'THE LANTERN SIEGE';
    $('supplies').textContent = `Lantern ${state.light} · Trust ${state.trust}`;
    $('world-note').textContent = scene.endingTitle || 'Pix travels at your side';
    $('ending-badge').textContent = scene.ending ? `${scene.ending === 'good' ? 'Hopeful' : 'Dark'} ending` : '';
    $('lesson').hidden = !scene.lesson;
    $('lesson').textContent = scene.lesson || '';
    $('choices').replaceChildren();
    $('puzzle').hidden = true;
    $('continue').hidden = !state.solved;
    $('continue').disabled = !started;
    $('run').disabled = !started;
    $('hint').disabled = !started;
    $('feedback').hidden = !feedback;
    if (feedback) {
      $('feedback').className = feedback.kind;
      $('feedback').textContent = feedback.text;
    }
    const snapshot = { sceneId: state.sceneId, revision: state.revision };
    if (scene.kind === 'code') {
      $('puzzle').hidden = state.solved;
      if (!state.solved) $('code').value = state.draft ?? scene.code.starter;
    } else if (!state.solved) {
      const options = scene.options || scene.choices || [];
      options.forEach((choice, index) => {
        const action = scene.options
          ? { ...snapshot, type: 'submit', value: choice.id }
          : { ...snapshot, type: 'choice', index };
        $('choices').append(makeChoice(choice.label, choice.description, index + 1, () => dispatch(action)));
      });
    }
    if (scene.ending) {
      $('choices').append(makeChoice('Begin a different path', 'New decisions can reveal another ending.', '↻', restart));
    }
    $('replay').disabled = !started || muted;
    if (focus) $('scene-title').focus({ preventScroll: true });
    if (narrate) speak(`${scene.title}. ${scene.text} Your mission: ${scene.objective}`, true);
  }

  function dispatch(action) {
    if (!started || busy) return;
    busy = true;
    const previous = state.sceneId;
    const result = E.act(state, action);
    state = result.state;
    feedback = result.feedback;
    if (state.sceneId !== previous) {
      feedback = null;
      delete state.draft;
    }
    persist();
    render({ focus: state.sceneId !== previous, narrate: state.sceneId !== previous });
    if (result.feedback && state.sceneId === previous) {
      if (['success', 'error'].includes(result.feedback.kind)) art.pulse(result.feedback.kind);
      speak(result.feedback.text);
    }
    // A short transition lock prevents one rapid click from choosing two scenes.
    setTimeout(() => { busy = false; }, 280);
  }

  function restart() {
    stopVoice();
    state = E.createState();
    feedback = null;
    started = true;
    busy = false;
    $('intro').hidden = true;
    persist();
    render({ focus: true, narrate: true });
  }

  $('begin').addEventListener('click', () => {
    started = true;
    $('intro').hidden = true;
    render({ focus: true, narrate: true });
  });
  $('restart').addEventListener('click', restart);
  $('puzzle').addEventListener('submit', event => {
    event.preventDefault();
    dispatch({ sceneId: state.sceneId, revision: state.revision, type: 'submit', value: $('code').value });
  });
  $('code').addEventListener('input', () => {
    state.draft = $('code').value;
    persist();
  });
  $('code').addEventListener('keydown', event => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      $('puzzle').requestSubmit();
    }
  });
  $('hint').addEventListener('click', () => {
    dispatch({ sceneId: state.sceneId, revision: state.revision, type: 'hint' });
  });
  $('continue').addEventListener('click', () => {
    dispatch({ sceneId: state.sceneId, revision: state.revision, type: 'continue' });
  });
  $('mute').addEventListener('click', () => {
    muted = !muted;
    stopVoice();
    $('mute').textContent = muted ? 'Voice off' : 'Voice on';
    $('mute').setAttribute('aria-pressed', String(muted));
    $('replay').disabled = muted || !started;
    $('voice-status').textContent = muted ? 'Muted · story text remains available' : 'Press Replay to hear this scene';
  });
  $('replay').addEventListener('click', () => {
    const scene = E.getScene(state);
    speak(`${scene.title}. ${scene.text} Your mission: ${scene.objective}`, true);
  });
  $('journal').addEventListener('click', () => {
    $('log-list').replaceChildren();
    const entries = state.journal || [];
    entries.forEach(entry => {
      const li = document.createElement('li');
      const from = E.scenes.find(scene => scene.id === entry.from);
      const to = E.scenes.find(scene => scene.id === entry.to);
      li.textContent = `${from?.title || entry.from} → ${to?.title || entry.to}`;
      $('log-list').append(li);
    });
    if (!entries.length) {
      const li = document.createElement('li');
      li.textContent = 'Your adventure is just beginning.';
      $('log-list').append(li);
    }
    $('log-dialog').showModal();
  });
  $('close-log').addEventListener('click', () => $('log-dialog').close());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopVoice();
  });
  window.addEventListener('pagehide', stopVoice);
  window.addEventListener('resize', () => art.resize());
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const restored = E.restore(saved);
      state = restored.state;
      feedback = state.feedback;
      if (restored.ok) $('begin').textContent = 'Resume your journey';
    }
  } catch (_) {
    state = E.createState();
  }
  render();
  // Small read-only inspection surface for reproducible local QA.
  window.CircuitboundUI = {
    getState: () => JSON.parse(JSON.stringify(state)),
    getVoiceState: () => ({ muted, started, status: $('voice-status').textContent }),
    renderAt: seconds => art.renderAt(seconds)
  };
})();
