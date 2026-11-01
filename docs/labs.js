/* Shared enhancements. Everything essential remains visible without JavaScript. */
(() => {
  'use strict';
  // Keep the shop available in the shared navigation on every current page.
  // The Support page also has static links and styles for the no-JS path.
  if (!document.querySelector('link[data-kira-shop-styles]')) {
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = new URL('shop.css?v=20260928', document.currentScript?.src || document.baseURI).href;
    styles.setAttribute('data-kira-shop-styles', '');
    document.head.appendChild(styles);
  }
  document.querySelector('.site-header')?.classList.add('shop-navigation');
  document.querySelectorAll('#primary-nav, .footlinks').forEach(links => {
    if (links.querySelector('a[href="https://shop.kiralabs.org/"], a[href="https://shop.kiralabs.org"]')) return;
    const shop = document.createElement('a');
    shop.href = 'https://shop.kiralabs.org/';
    shop.className = 'shop-link';
    shop.textContent = 'Shop';
    links.insertBefore(shop, links.querySelector('a.contact, a[href="contact.html"]'));
  });
  // Give the public guide its own navigation destination. It does not send messages.
  document.querySelectorAll('#primary-nav, .footlinks').forEach(links => {
    if (links.querySelector('a[href="iris.html"]')) return;
    const a=document.createElement('a');a.href=new URL('iris.html',document.currentScript?.src||document.baseURI).href;a.textContent='Ask Iris';
    if (location.pathname.endsWith('/iris.html')) a.setAttribute('aria-current','page');
    links.insertBefore(a, links.querySelector('a[href="contact.html"],a.contact') || null);
  });
  // Contact is a message channel; Iris is a separate informational guide.
  document.querySelectorAll('.footlinks a[href="contact.html"]').forEach(a=>{
    if(a.textContent.includes('Iris')) a.textContent='Contact Robert';
  });
  document.body.classList.add('js');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  const close = () => { if (menu && nav) { menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu'; nav.classList.remove('open'); } };
  if (menu && nav) {
    menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); menu.textContent = open ? 'Close' : 'Menu'; });
    nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { close(); menu.focus(); } });
    window.matchMedia('(min-width: 1001px)').addEventListener('change', close);
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

  // One original floating entrypoint on the public site; the dedicated Iris
  // page and its embedded view must never create a second/re-entrant widget.
  if (!/\/iris\.html$/i.test(location.pathname) && !document.getElementById('kira-iris-widget')) {
    const sharedScriptBase = document.currentScript?.src || document.baseURI;
    const widgetStyles = document.createElement('link');
    widgetStyles.rel = 'stylesheet';
    widgetStyles.href = new URL('iris-float.css?v=20261101.1', sharedScriptBase).href;
    widgetStyles.setAttribute('data-kira-iris-widget-styles', '');
    document.head.appendChild(widgetStyles);

    const widget = document.createElement('div');
    widget.className = 'kira-iris-widget';
    widget.id = 'kira-iris-widget';
    widget.innerHTML = `
      <button type="button" class="kira-iris-launcher" id="kira-iris-open"
        aria-haspopup="dialog" aria-controls="kira-iris-panel" aria-expanded="false"
        aria-label="Open Ask Iris, the Kira Labs website guide">
        <span class="kira-iris-mark" aria-hidden="true">I</span>
        <span class="kira-iris-launcher-label">Ask Iris</span>
      </button>
      <section id="kira-iris-panel" class="kira-iris-panel" role="dialog"
        aria-modal="false" aria-labelledby="kira-iris-panel-title" hidden>
        <div class="kira-iris-panel-head">
          <span class="kira-iris-mark" aria-hidden="true">I</span>
          <div class="kira-iris-panel-brand">
            <strong id="kira-iris-panel-title">Ask Iris</strong>
            <small>Kira Labs website guide</small>
          </div>
          <div class="kira-iris-panel-actions">
            <a class="kira-iris-full" aria-label="Open full Iris page" title="Open full Iris page" href="iris.html">↗</a>
            <button type="button" class="kira-iris-close" aria-label="Close Iris chat" title="Close Iris chat">×</button>
          </div>
        </div>
        <iframe class="kira-iris-frame" title="Iris interactive chat and published Kira Labs answers"></iframe>
        <div class="kira-iris-panel-foot">Published information · Not a message to Robert</div>
      </section>`;
    document.body.appendChild(widget);

    const launcher = widget.querySelector('#kira-iris-open');
    const panel = widget.querySelector('#kira-iris-panel');
    const closer = widget.querySelector('.kira-iris-close');
    const frame = widget.querySelector('.kira-iris-frame');
    widget.querySelector('.kira-iris-full').href = new URL('iris.html', sharedScriptBase).href;

    function closeIris(restoreFocus = true) {
      if (panel.hidden) return;
      panel.hidden = true;
      launcher.setAttribute('aria-expanded', 'false');
      if (restoreFocus) launcher.focus();
    }
    function openIris() {
      panel.hidden = false;
      launcher.setAttribute('aria-expanded', 'true');
      // Load once on first use; closing never discards the conversation.
      if (!frame.hasAttribute('src')) frame.src = new URL('iris.html?embed=1', sharedScriptBase).href;
      closer.focus();
    }
    launcher.addEventListener('click', () => panel.hidden ? openIris() : closeIris());
    closer.addEventListener('click', () => closeIris());
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) {
        event.preventDefault();
        closeIris();
      }
    });
    document.addEventListener('pointerdown', event => {
      if (!panel.hidden && !widget.contains(event.target)) closeIris(false);
    });
    window.addEventListener('message', event => {
      if (event.origin === location.origin && event.source === frame.contentWindow &&
          event.data?.type === 'kira-iris-close') closeIris();
    });
  }

  // Partner path: show it in existing navigation, without duplicating static links.
  const partnerNav=document.getElementById('primary-nav');
  if(partnerNav&&!partnerNav.querySelector('a[href="partners.html"]')){
    const supportLink=partnerNav.querySelector('a[href="support.html"]');
    const item=document.createElement('a');item.href=new URL('partners.html',document.currentScript?.src||document.baseURI).href;item.textContent='Partners';
    if(supportLink)supportLink.insertAdjacentElement('afterend',item);
    else partnerNav.appendChild(item);
  }
})();
