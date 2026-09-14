/* Shared enhancements. Everything essential remains visible without JavaScript. */
(() => {
  'use strict';
  document.body.classList.add('js');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  const close = () => { if (menu && nav) { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); } };
  if (menu && nav) {
    menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
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
  const form = document.getElementById('contact-form');
  if (!form) return;
  const email = 'rmcmurrer@kiralabs.org';
  const result = document.getElementById('contact-result');
  const output = document.getElementById('draft-link');
  const status = document.getElementById('contact-status');
  const copy = document.getElementById('copy-draft');
  let draft = '';
  const reason = new URLSearchParams(location.search).get('reason');
  if (reason && [...form.elements.reason.options].some(o => o.value === reason)) form.elements.reason.value = reason;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.elements.name.value.trim();
    const sender = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    if (!name || !message) { status.textContent = 'Please enter your name and a message, not only spaces.'; return; }
    const subject = 'Kira Labs — ' + form.elements.reason.value;
    const body = message + '\n\nFrom: ' + name + '\nReply to: ' + sender;
    draft = 'To: ' + email + '\nSubject: ' + subject + '\n\n' + body;
    output.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    result.hidden = false;
    status.textContent = 'Your draft is ready. Nothing has been sent. Open your email app, or copy the draft into your email service and send it there.';
    output.focus();
  });
  document.getElementById('prepare-email').disabled = false;
  copy.addEventListener('click', async () => {
    if (!draft) return;
    try { await navigator.clipboard.writeText(draft); status.textContent = 'Draft copied. Paste it into your email service and send it to ' + email + '. Nothing has been sent by this page.'; }
    catch { const text = document.getElementById('draft-text'); text.value = draft; text.hidden = false; text.focus(); text.select(); status.textContent = 'Automatic copying is unavailable. Copy the selected draft below. Nothing has been sent.'; }
  });
})();
