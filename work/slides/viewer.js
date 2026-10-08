(() => {
  const root = document.documentElement;
  const width = Number(root.dataset.pageWidth || 1280);
  const height = Number(root.dataset.pageHeight || 720);
  if (!(width > 0 && height > 0 && Number.isFinite(width + height))) throw new Error('Invalid page dimensions');
  root.style.setProperty('--page-width', width + 'px');
  root.style.setProperty('--page-height', height + 'px');
  const printStyle = document.createElement('style');
  printStyle.textContent = `@page { size:${width}px ${height}px; margin:0; }`;
  document.head.append(printStyle);
  const pages = [...document.querySelectorAll('.sheet')];
  if (!pages.length || new Set(pages.map(p => p.id)).size !== pages.length || pages.some(p => !p.id)) {
    throw new Error('Pages need unique nonempty IDs');
  }
  const mainPages = pages.filter(p => !p.hasAttribute('data-optional'));
  if (!mainPages.length || pages.some(p => p.hasAttribute('data-optional') && !mainPages.some(m => m.id === p.dataset.parent))) {
    throw new Error('Optional pages need a main-route parent');
  }
  pages.forEach(page => {
    const position = mainPages.findIndex(main => main.id === (page.dataset.parent || page.id)) + 1;
    const counter = document.createElement('span');
    counter.className = 'page-counter';
    counter.textContent = `${String(position).padStart(2, '0')}/${String(mainPages.length).padStart(2, '0')}`;
    counter.setAttribute('aria-label', `Слайд ${position} из ${mainPages.length}`);
    const progress = document.createElement('div');
    progress.className = 'page-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.style.width = `${position / mainPages.length * 100}%`;
    page.append(counter, progress);
  });
  function neighbor(delta) {
    const current = pages[index];
    const parentIndex = mainPages.findIndex(p => p.id === (current.dataset.parent || current.id));
    const destination = current.hasAttribute('data-optional') && delta < 0 ? parentIndex : parentIndex + delta;
    return mainPages[destination];
  }
  function step(delta) {
    const destination = neighbor(delta);
    if (destination) show(pages.indexOf(destination), true);
  }
  const viewport = document.querySelector('.viewport');
  const stage = document.querySelector('.stage');
  const previous = document.querySelector('#previous'), next = document.querySelector('#next');
  const zoom = document.querySelector('#zoom'), theme = document.querySelector('#theme');
  let index = 0, fit = true;
  function resize() {
    const scale = fit ? Math.min(1, viewport.clientWidth / width, viewport.clientHeight / height) : 1;
    stage.style.width = width * scale + 'px'; stage.style.height = height * scale + 'px';
    pages.forEach(p => { p.style.transform = `scale(${scale})`; });
  }
  function show(n, push = false) {
    index = Math.max(0, Math.min(pages.length - 1, n));
    pages.forEach((p, i) => { p.hidden = i !== index; p.classList.toggle('active', i === index); });
    previous.disabled = !neighbor(-1); next.disabled = !neighbor(1);
    if (push && location.hash !== '#' + pages[index].id) history.pushState(null, '', '#' + pages[index].id);
    viewport.scrollTo(0, 0);
  }
  function fromHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = ''; }
    const found = pages.findIndex(p => p.id === id);
    show(found < 0 ? 0 : found);
    if (found < 0) history.replaceState(null, '', '#' + pages[0].id);
  }
  function themeLabel() {
    theme.textContent = ['light', 'print'].includes(root.dataset.theme) ? 'Тёмная тема' : 'Светлая тема';
  }
  document.querySelectorAll('.toc a, a[data-slide-link]').forEach(a => a.addEventListener('click', e => {
    const found = pages.findIndex(p => '#' + p.id === a.hash);
    if (found >= 0) { e.preventDefault(); show(found, true); }
  }));
  previous.onclick = () => step(-1);
  next.onclick = () => step(1);
  theme.onclick = () => { root.dataset.theme = ['light', 'print'].includes(root.dataset.theme) ? 'dark' : 'light'; themeLabel(); };
  zoom.onclick = () => { fit = !fit; zoom.textContent = fit ? '100%' : 'Вписать'; resize(); };
  document.querySelector('#export').onclick = () => window.print();
  document.addEventListener('keydown', e => {
    if (document.querySelector('dialog[open]')) return;
    if (e.target.closest('button,a,input,select,textarea,[contenteditable="true"]')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  addEventListener('resize', resize);
  addEventListener('popstate', fromHash);
  addEventListener('hashchange', fromHash);
  fromHash(); resize(); themeLabel();
})();
