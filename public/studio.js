(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#primary-nav');
  const closeMenu = () => { nav?.classList.remove('open'); toggle?.setAttribute('aria-expanded', 'false'); };
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) { closeMenu(); toggle.focus(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  const desktop = matchMedia('(min-width:801px)');
  desktop.addEventListener('change', closeMenu);
  const motion = document.querySelector('.motion-toggle');
  if (motion) {
    motion.hidden = false;
    motion.addEventListener('click', () => {
      const paused = document.body.classList.toggle('is-paused');
      motion.setAttribute('aria-pressed', String(paused));
      motion.textContent = paused ? 'Play motion ▷' : 'Pause motion Ⅱ';
    });
    const hero = document.querySelector('.hero-canvas');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        hero.style.setProperty('--visible', entries[0].isIntersecting ? 'running' : 'paused');
      }).observe(hero);
    }
  }
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-status]')];
  function filterProducts(value) {
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === value)));
    cards.forEach(card => { card.hidden = value !== 'all' && card.dataset.status !== value; });
    const status = document.querySelector('#filter-status');
    if (status) status.textContent = `${cards.filter(card => !card.hidden).length} ${cards.filter(card => !card.hidden).length === 1 ? "tool" : "tools"} shown`;
  }
  filters.forEach(button => button.addEventListener('click', () => filterProducts(button.dataset.filter)));
  window.addEventListener('hashchange', () => { if (location.hash === '#map-editor') filterProducts('all'); });
})();
