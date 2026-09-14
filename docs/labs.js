/* Shared enhancements. Everything essential remains visible without JavaScript. */
(() => {
  'use strict';
  document.body.classList.add('js');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  const close = () => { if (menu && nav) { menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu'; nav.classList.remove('open'); } };
  if (menu && nav) {
    menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); menu.textContent = open ? 'Close' : 'Menu'; });
    nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { close(); menu.focus(); } });
    window.matchMedia('(min-width: 851px)').addEventListener('change', close);
  }
  document.querySelectorAll('img[data-existing-asset]').forEach(img => {
    const unavailable = () => {
      if (img.nextElementSibling?.classList.contains('media-unavailable')) return;
      img.hidden = true;
      const text = document.createElement('span'); text.className = 'media-unavailable';
      text.textContent = 'Image unavailable here. Open the original image to view this documented work.';
      img.insertAdjacentElement('afterend', text);
    };
    const handleFailure = () => {
      // The GitHub branch includes the original assets. The downloadable review
      // bundle can also view them from the current public site without changing it.
      if (!img.dataset.triedPublic && location.protocol === 'file:') {
        img.dataset.triedPublic = 'true'; img.src = 'https://kiralabs.org/' + img.dataset.existingAsset;
      } else unavailable();
    };
    img.addEventListener('error', handleFailure);
    if (img.complete && !img.naturalWidth) handleFailure();
  });
  document.querySelectorAll('img:not([data-existing-asset]):not([data-timeline-image])').forEach(img => {
    const failed = () => {
      if (img.closest('.brandmark')) { img.hidden = true; img.parentElement.textContent = 'K'; return; }
      if (img.dataset.failureShown) return;
      img.dataset.failureShown = 'true';
      const note = document.createElement('span'); note.className = 'asset-warning';
      note.textContent = 'Existing site image · connect to the internet to view';
      img.style.visibility = 'hidden'; img.insertAdjacentElement('afterend', note);
    };
    img.addEventListener('error', failed, {once:true});
    if (img.complete && !img.naturalWidth) failed();
  });
})();
