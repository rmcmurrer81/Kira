/* Lab-wide explorer. Static HTML remains the complete no-JavaScript fallback. */
(() => {
  'use strict';
  const root = document.getElementById('timeline-explorer');
  const data = window.KIRA_LABS_TIMELINE;
  if (!root || !data || !Array.isArray(data.milestones) || !data.milestones.length) return;
  const list = document.getElementById('milestone-list');
  const detail = document.getElementById('milestone-detail');
  const counter = document.getElementById('timeline-count');
  const search = document.getElementById('timeline-search');
  const statusSelect = document.getElementById('timeline-status');
  const sort = document.getElementById('timeline-sort');
  const projectButtons = [...root.querySelectorAll('[data-project]')];
  const url = new URL(location.href);
  let project = data.projects.includes(url.searchParams.get('project')) ? url.searchParams.get('project') : 'all';
  let selected = '';
  try { selected = decodeURIComponent(location.hash.slice(1)); } catch { /* invalid anchor falls back to the first result */ }
  let visible = [];
  let queryTimer;
  const make = (tag, text, className) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (className) e.className = className; return e; };
  const validURL = value => { try { const u = new URL(value, location.href); return ['https:', 'http:'].includes(u.protocol); } catch { return false; } };
  const dateLabel = m => m.date ? new Date(m.date + 'T12:00:00Z').toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}) : m.status === 'future' ? 'Future goal · no date set' : 'Undated · reviewed ' + m.reviewed_on;
  const updateURL = () => {
    const u = new URL(location.href);
    if (project === 'all') u.searchParams.delete('project'); else u.searchParams.set('project', project);
    if (statusSelect.value === 'all') u.searchParams.delete('status'); else u.searchParams.set('status', statusSelect.value);
    // The search input is deliberately NOT placed in the URL or persistent storage.
    u.hash = selected;
    try { history.replaceState(null, '', u); } catch { /* file previews still work without URL updates */ }
  };
  function showDetail(m, focus = false) {
    detail.replaceChildren();
    if (!m) {
      detail.append(make('h2','No matching milestones.'), make('p','Try a different project, progress state or search term. Every entry remains available under All Kira Labs.', 'muted'));
      return;
    }
    const kicker = make('p', m.project + (m.track !== m.project ? ' / ' + m.track : ''), 'eyebrow');
    const badge = make('span', data.statuses[m.status], 'pill ' + m.status);
    const title = make('h2', m.title);
    const date = make('p',dateLabel(m) + ' · ' + m.date_basis,'date-basis');
    detail.append(kicker,badge,title,date,make('p',m.summary,'summary'));
    detail.querySelector('.summary').style.marginTop = '22px';
    if (m.body) detail.append(make('p',m.body,'description'));
    const boundary = make('p',undefined,'boundary');
    boundary.append(make('strong','What this does not establish: '),document.createTextNode(m.boundary));
    detail.append(boundary);
    if (m.image && /^assets\/[a-z0-9._-]+$/i.test(m.image.path)) {
      const figure = make('figure',undefined,'media-frame');
      const link = make('a'); link.href = 'https://kiralabs.org/' + m.image.path; link.setAttribute('aria-label','Open original image: ' + m.image.alt);
      const img = make('img'); img.alt = m.image.alt; img.loading = 'lazy';
      img.addEventListener('error', () => { img.hidden = true; if (!link.querySelector('.media-unavailable')) link.append(make('span','Open the original documented image ↗','media-unavailable')); }, {once:true});
      img.src = location.protocol === 'file:' ? 'https://kiralabs.org/' + m.image.path : m.image.path;
      const cap = make('figcaption'); cap.append(make('strong',m.image.label),document.createTextNode(m.image.caption));
      link.append(img); figure.append(link,cap); detail.append(figure);
    }
    detail.append(make('p','SOURCE RECORD','smallcaps'));
    detail.lastElementChild.style.marginTop = '26px';
    const sources = make('div',undefined,'source-list');
    m.sources.filter(s => validURL(s.url)).forEach(s => { const a = make('a',s.label + ' ↗'); a.href = s.url; sources.append(a); });
    detail.append(sources);
    const controls = make('div',undefined,'detail-nav');
    const index = visible.findIndex(v => v.id === m.id);
    for (const [direction,label] of [[-1,'← Previous'],[1,'Next →']]) {
      const b = make('button',label); b.type = 'button'; b.disabled = !visible[index + direction];
      b.addEventListener('click', () => { selected = visible[index + direction].id; render(true); });
      controls.append(b);
    }
    detail.append(controls);
    if (focus) detail.focus({preventScroll:true});
  }
  function render(focus = false, writeURL = true) {
    const query = search.value.trim().toLowerCase();
    const tokens = query.split(/\s+/).filter(Boolean);
    const status = statusSelect.value;
    visible = data.milestones.filter(m => (project === 'all' || m.project === project) && (status === 'all' || m.status === status) && tokens.every(t => (m.title+' '+m.summary+' '+m.body+' '+m.track+' '+m.project+' '+m.boundary).toLowerCase().includes(t)));
    visible.sort((a,b) => {
      if (!!a.date !== !!b.date) return a.date ? -1 : 1;
      if (a.date && b.date) return sort.value === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
      const ranks = {prototype:0,development:1,archive:2,future:3};
      return (ranks[a.status] ?? 4) - (ranks[b.status] ?? 4) || a.title.localeCompare(b.title);
    });
    if (!visible.some(m => m.id === selected)) selected = visible[0]?.id || '';
    list.replaceChildren();
    projectButtons.forEach(b => b.setAttribute('aria-pressed',String(b.dataset.project === project)));
    for (const m of visible) {
      const li = make('li');
      const b = make('button',undefined,'milestone-button'); b.type = 'button'; b.dataset.id = m.id; b.setAttribute('aria-pressed',String(m.id === selected));
      b.append(make('span',dateLabel(m) + ' / ' + m.project,'meta'),make('strong',m.title),make('span',data.statuses[m.status],'state'));
      b.addEventListener('click', () => { selected = m.id; render(true); });
      li.append(b); list.append(li);
    }
    if (!visible.length) list.append(make('li','No matching entries. Clear search or select All Kira Labs.','empty-state'));
    counter.textContent = visible.length + ' of ' + data.milestones.length + ' public milestones · ' + (project === 'all' ? 'the whole lab' : project) + ' · undated snapshots and goals follow the dated record.';
    showDetail(visible.find(m => m.id === selected),focus);
    if (writeURL) updateURL();
    // Mobile keeps the selected card in its horizontal rail without pulling the
    // whole document away from the visitor's reading position.
    if (innerWidth <= 850 && selected) {
      const b = list.querySelector('[aria-pressed="true"]');
      if (b) list.scrollLeft = Math.max(0,b.parentElement.offsetLeft-list.offsetLeft-12);
    }
  }
  if (data.statuses[url.searchParams.get('status')]) statusSelect.value = url.searchParams.get('status');
  projectButtons.forEach(b => b.addEventListener('click', () => { project = b.dataset.project; render(); }));
  statusSelect.addEventListener('change', () => render());
  sort.addEventListener('change', () => render());
  search.addEventListener('input', () => { clearTimeout(queryTimer); queryTimer = setTimeout(() => render(),120); });
  addEventListener('hashchange', () => {
    let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (!data.milestones.some(m => m.id === id)) return;
    selected = id;
    if (!visible.some(m => m.id === id)) { project = 'all'; statusSelect.value = 'all'; search.value = ''; }
    render();
  });
  try { render(false, false); root.classList.add('enhanced'); }
  catch (error) { root.classList.remove('enhanced'); console.error('Timeline enhancement unavailable; full static record remains visible.',error); }
})();
