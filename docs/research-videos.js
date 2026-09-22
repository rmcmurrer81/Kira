/* Click-to-load YouTube playlists. The supplied links remain usable without JS. */
(function () {
  'use strict';
  var cards = Array.from(document.querySelectorAll('.rv-card'));
  function reset(card, focus) {
    var frame = card.querySelector('.rv-stage iframe');
    if (frame) frame.remove();
    var preview = card.querySelector('[data-playlist-preview]');
    preview.hidden = false;
    card.querySelector('.rv-close').hidden = true;
    card.querySelector('.rv-status').textContent = '';
    if (focus) preview.focus();
  }
  cards.forEach(function (card) {
    var preview = card.querySelector('[data-playlist-preview]');
    var close = card.querySelector('.rv-close');
    if (!preview || !close) return;
    var supplied;
    try { supplied = new URL(preview.href); } catch (_) { return; }
    var list = supplied.searchParams.get('list');
    // Preserve the owner-supplied ID verbatim; do not fabricate missing characters.
    // Valid syntax is not a claim that YouTube has verified this playlist.
    if (supplied.protocol !== 'https:' || supplied.hostname !== 'www.youtube.com' ||
        supplied.pathname !== '/playlist' || !list || !/^PL[A-Za-z0-9_-]{1,100}$/.test(list)) return;
    preview.setAttribute('role', 'button');
    preview.setAttribute('aria-controls', card.querySelector('.rv-stage').id);
    preview.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) return;
      event.preventDefault();
      cards.forEach(function (other) { reset(other, false); });
      var embed = new URL('https://www.youtube-nocookie.com/embed');
      embed.searchParams.set('listType', 'playlist');
      embed.searchParams.set('list', list);
      embed.searchParams.set('autoplay', '1');
      embed.searchParams.set('playsinline', '1');
      embed.searchParams.set('rel', '0');
      var frame = document.createElement('iframe');
      frame.title = card.querySelector('h3').textContent + ' — YouTube playlist';
      frame.src = embed.toString();
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      preview.hidden = true;
      card.querySelector('.rv-stage').appendChild(frame);
      close.hidden = false;
      card.querySelector('.rv-status').textContent = 'Use the YouTube playlist menu to choose an episode. If playback is unavailable, open the playlist directly or use the channel links below.';
      frame.focus();
    });
    preview.addEventListener('keydown', function (event) {
      if (event.key === ' ') { event.preventDefault(); preview.click(); }
    });
    close.addEventListener('click', function () { reset(card, true); });
  });
}());
