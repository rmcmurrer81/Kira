/* Kira Labs Arcade homepage: optional gesture-triggered sound and local explorer passport.
 * Only counts a game or lesson when the visitor opens it from this page.
 * No account, external trackers, fabricated game completion, or autoplay audio.
 */
(() => {
  'use strict';
  if (!document.body.classList.contains('arcade-home')) return;

  const KEY = 'kira.arcade.passport.v1';
  const GAMES = Object.freeze(['code-quest', 'circuitbound', 'little-signal', 'firefly-trail']);
  const LESSONS = Object.freeze(['code-quest', 'little-signal', 'firefly-trail']);
  const get = id => document.getElementById(id);
  const isReduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  let audioOn = false;
  let context = null;
  let persistenceAvailable = false;
  let gameVisits = [];
  let lessonVisits = [];

  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) || '{}');
    if (Array.isArray(saved.games)) gameVisits = GAMES.filter(id => saved.games.includes(id));
    if (Array.isArray(saved.lessons)) lessonVisits = LESSONS.filter(id => saved.lessons.includes(id));
    // Probe storage without saving new information.
    const probeKey = KEY + '.probe';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    persistenceAvailable = true;
  } catch (_) {
    persistenceAvailable = false;
  }

  function save() {
    if (!persistenceAvailable) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({games: gameVisits, lessons: lessonVisits}));
    } catch (_) {
      persistenceAvailable = false;
    }
  }

  function renderPassport(message = '') {
    const count = gameVisits.length;
    get('ar-visit-count').textContent = count + ' / ' + GAMES.length;
    const progress = get('ar-visit-progress');
    progress.setAttribute('aria-valuenow', String(count));
    get('ar-visit-fill').style.width = (100 * count / GAMES.length) + '%';
    const badges = {
      starter: count > 0,
      pathfinder: count >= 3,
      creator: lessonVisits.length > 0
    };
    Object.entries(badges).forEach(([id, unlocked]) => {
      const node = document.querySelector('.ar-badge[data-badge="' + id + '"]');
      if (!node) return;
      node.dataset.unlocked = String(unlocked);
      node.setAttribute('aria-label', (unlocked ? 'Unlocked: ' : 'Not yet unlocked: ') + node.querySelector('strong').textContent);
    });
    if (!message) {
      message = count
        ? 'You have launched ' + count + ' of the 4 games from this page.'
        : 'Choose a game to earn your First Step badge.';
    }
    get('ar-passport-status').textContent = message + (persistenceAvailable ? '' : ' This session only; local saving is unavailable.');
  }

  function playCue(kind = 'tap') {
    if (!audioOn) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      if (!context) context = new Audio();
      if (context.state === 'suspended') context.resume().catch(() => {});
      const now = context.currentTime;
      const notes = kind === 'on' ? [523.25, 659.25, 783.99] : [622.25, 783.99];
      notes.forEach((frequency, index) => {
        const osc = context.createOscillator();
        const volume = context.createGain();
        const at = now + index * 0.1;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, at);
        volume.gain.setValueAtTime(0.0001, at);
        volume.gain.exponentialRampToValueAtTime(0.038, at + 0.018);
        volume.gain.exponentialRampToValueAtTime(0.0001, at + 0.19);
        osc.connect(volume);
        volume.connect(context.destination);
        osc.start(at);
        osc.stop(at + 0.20);
      });
    } catch (_) {
      // Audio permissions or devices can fail; the page and navigation still work.
    }
  }

  get('ar-sound-toggle').addEventListener('click', () => {
    audioOn = !audioOn;
    const button = get('ar-sound-toggle');
    button.setAttribute('aria-pressed', String(audioOn));
    button.textContent = audioOn ? '♫ Arcade sound: On' : '♫ Arcade sound: Off';
    get('ar-sound-status').textContent = audioOn
      ? 'Short original tones enabled for arcade links. In-game voices are separate.'
      : 'Sound previews only play when you turn them on.';
    if (audioOn) playCue('on');
  });

  // Synchronous local save occurs before a normal link navigation. The visitor
  // can open games in another tab using standard browser controls.
  document.querySelectorAll('a[data-arcade-visit], a[data-arcade-learn]').forEach(anchor => {
    anchor.addEventListener('click', () => {
      let changed = false;
      const game = anchor.dataset.arcadeVisit;
      const lesson = anchor.dataset.arcadeLearn;
      if (GAMES.includes(game) && !gameVisits.includes(game)) {
        gameVisits.push(game);
        changed = true;
      }
      if (LESSONS.includes(lesson) && !lessonVisits.includes(lesson)) {
        lessonVisits.push(lesson);
        changed = true;
      }
      if (changed) save();
      renderPassport(changed ? 'New arcade passport discovery recorded!' : '');
      playCue('tap');
    });
  });

  get('ar-passport-reset').addEventListener('click', () => {
    if (!window.confirm('Reset the Arcade passport on this browser? This does not change saved progress inside any game.')) return;
    gameVisits = [];
    lessonVisits = [];
    save();
    renderPassport('Arcade passport reset. Choose a game to start again.');
    playCue('tap');
  });

  window.addEventListener('pagehide', () => {
    if (context) {
      try { context.close(); } catch (_) {}
      context = null;
    }
  });

  renderPassport();
})();
