/* Per-slide notes stay in templates; only the active slide populates the panel. */
(() => {
  const pages = [...document.querySelectorAll('.sheet')];
  const button = document.querySelector('#notes');
  const panel = document.querySelector('#speaker-notes');
  const title = document.querySelector('#notes-title');
  const body = document.querySelector('#notes-body');
  const time = document.querySelector('#notes-time');
  function refresh() {
    const current = document.querySelector('.sheet.active');
    const number = current.dataset.folio || String(pages.indexOf(current) + 1).padStart(2,'0');
    title.textContent = `${number} · ${current.getAttribute('aria-label')}`;
    time.textContent = current.dataset.time;
    body.replaceChildren(current.querySelector('.speaker-notes').content.cloneNode(true));
    document.querySelectorAll('.toc a').forEach(link => {
      if (link.hash === '#' + current.id) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
  }
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    document.body.classList.toggle('notes-open',open);
    dispatchEvent(new Event('resize'));
  });
  const observer = new MutationObserver(refresh);
  pages.forEach(page => observer.observe(page,{attributes:true,attributeFilter:['class']}));
  refresh();
  document.querySelectorAll('.figure-open').forEach(trigger => {
    const id = trigger.dataset.figure || 'figure-dialog';
    const dialog = document.getElementById(id);
    if (!(dialog instanceof HTMLDialogElement)) throw new Error(`Unknown figure dialog: ${id}`);
    trigger.addEventListener('click', () => dialog.showModal());
  });
  document.querySelectorAll('#figure-close, .figure-close').forEach(button => {
    button.addEventListener('click', () => button.closest('dialog').close());
  });
})();
