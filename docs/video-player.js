/* Progressive YouTube video cards.
 * Downloaded / sandboxed previews open the real watch page, not an empty iframe.
 * Ordinary hosted pages load YouTube's official player only after a click.
 * A loading deadline and onError restore the poster and a working watch link.
 */
(() => {
  'use strict';
  const mounts = new WeakMap();
  let apiPromise = null, nextId = 0;
  const el = (tag, text, cls) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  function isPreview() {
    return Boolean(window.KIRA_LABS_PREVIEW) ||
      !/^https?:$/.test(location.protocol) || window.origin === 'null';
  }
  function loadAPI() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      let settled = false;
      const script = document.createElement('script');
      const previous = window.onYouTubeIframeAPIReady;
      const done = error => {
        if (settled) return;
        settled = true; clearTimeout(timer);
        if (window.onYouTubeIframeAPIReady === ready) window.onYouTubeIframeAPIReady = previous;
        if (error) { script.remove(); reject(error); }
        else resolve(window.YT);
      };
      const ready = () => {
        try { if (typeof previous === 'function') previous(); }
        finally { done(window.YT?.Player ? null : new Error('Player API unavailable')); }
      };
      const timer = setTimeout(() => done(new Error('Player API timed out')), 9000);
      window.onYouTubeIframeAPIReady = ready;
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.referrerPolicy = 'strict-origin-when-cross-origin';
      script.onerror = () => done(new Error('Player API could not load'));
      document.head.append(script);
    }).catch(error => { apiPromise = null; throw error; });
    return apiPromise;
  }
  function clear(host) {
    const dispose = mounts.get(host);
    if (dispose) dispose();
    mounts.delete(host);
    host.replaceChildren();
  }
  function mount(host, options) {
    clear(host);
    if (!/^[A-Za-z0-9_-]{11}$/.test(options?.id || '')) return;
    const id = options.id, title = options.title || 'Public development video';
    const watchURL = 'https://www.youtube.com/watch?v=' + id;
    const preview = isPreview();
    let alive = true, attempt = 0, loading = false, player = null, timer = null;
    const card = el('section', undefined, 'kl-video-card');
    card.setAttribute('aria-label', 'Video: ' + title);
    card.dataset.videoId = id;
    card.append(el('p', 'Watch the development video', 'kl-video-eyebrow'));
    const poster = el('a', undefined, 'kl-video-poster');
    poster.href = watchURL; poster.target = '_blank'; poster.rel = 'noopener';
    poster.setAttribute('aria-label', (preview ? 'Watch on YouTube: ' : 'Play video: ') + title);
    const image = el('img', undefined, 'kl-video-thumbnail');
    image.alt = ''; image.width = 480; image.height = 360;
    image.loading = 'lazy'; image.decoding = 'async';
    image.dataset.videoPoster = 'true';
    image.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
    const credit = el('span', 'Video thumbnail', 'kl-video-credit');
    image.addEventListener('error', () => {
      // Do not mislabel a project screenshot as a frame from the video.
      const fallback = options.fallbackPoster || '';
      if (!image.dataset.usedFallback && /^https:\/\/kiralabs\.org\/assets\/[a-z0-9._-]+$/i.test(fallback)) {
        image.dataset.usedFallback = 'true';
        image.src = fallback;
        credit.textContent = 'Project illustration · not a video frame';
      } else {
        image.hidden = true;
        credit.textContent = 'Public video · thumbnail unavailable';
        poster.classList.add('no-thumbnail');
      }
    });
    const play = el('span', '▶', 'kl-video-play'); play.setAttribute('aria-hidden', 'true');
    const caption = el('span', undefined, 'kl-video-caption');
    caption.append(el('strong', title), el('span', preview ? 'Watch on YouTube ↗' : 'Play video', 'kl-video-action'));
    poster.append(image, credit, play, caption);
    const screen = el('div', undefined, 'kl-video-screen'); screen.hidden = true;
    const actions = el('div', undefined, 'kl-video-links');
    const external = el('a', 'Open on YouTube ↗'); external.href = watchURL; external.target = '_blank'; external.rel = 'noopener';
    actions.append(external);
    const status = el('p', preview
      ? 'Videos open on YouTube in this downloaded preview.'
      : 'The player loads after you choose Play. You can also watch on YouTube.', 'kl-video-status');
    status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    card.append(poster, screen, actions, status); host.append(card);
    const destroyPlayer = () => {
      clearTimeout(timer); timer = null;
      if (player) { try { player.destroy(); } catch (_) {} player = null; }
      screen.replaceChildren(); screen.hidden = true;
    };
    const fail = (token, message) => {
      if (!alive || token !== attempt) return;
      attempt++; loading = false; destroyPlayer(); poster.hidden = false;
      poster.removeAttribute('aria-busy');
      status.textContent = message + ' Use Open on YouTube to watch the video.';
    };
    poster.addEventListener('click', async event => {
      // Retain native navigation for local previews, modifier clicks and very narrow players.
      if (preview || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0 || card.clientWidth < 200) return;
      event.preventDefault();
      if (loading) return;
      loading = true;
      const token = ++attempt;
      poster.setAttribute('aria-busy', 'true');
      status.textContent = 'Loading the YouTube player…';
      timer = setTimeout(() => fail(token, 'The player did not finish loading.'), 15000);
      try {
        const YT = await loadAPI();
        if (!alive || token !== attempt) return;
        const slot = el('div'); slot.id = 'kl-youtube-' + (++nextId);
        screen.append(slot);
        // No playback starts while hidden. The native player is revealed only onReady.
        player = new YT.Player(slot, {
          width: Math.max(200,Math.round(card.clientWidth)), height: Math.max(200,Math.round(card.clientWidth*9/16)), host: 'https://www.youtube-nocookie.com', videoId: id,
          playerVars: {autoplay: 0, playsinline: 1, rel: 0, origin: location.origin},
          events: {
            onReady(event) {
              if (!alive || token !== attempt) { try { event.target.destroy(); } catch (_) {} return; }
              clearTimeout(timer); timer = null; loading = false;
              const frame = event.target.getIframe();
              frame.title = title; frame.referrerPolicy = 'strict-origin-when-cross-origin';
              frame.setAttribute('allow', 'encrypted-media; picture-in-picture; fullscreen');
              frame.setAttribute('allowfullscreen', '');
              poster.hidden = true; poster.removeAttribute('aria-busy'); screen.hidden = false;
              status.textContent = 'Press play in the video. Open on YouTube remains available.';
              frame.focus({preventScroll: true});
            },
            onError() { fail(token, 'YouTube could not play this video here.'); }
          }
        });
      } catch (_) { fail(token, 'The YouTube player is unavailable in this browser.'); }
    });
    mounts.set(host, () => { alive = false; attempt++; destroyPlayer(); });
  }
  window.KiraVideo = Object.freeze({mount, clear});
})();
