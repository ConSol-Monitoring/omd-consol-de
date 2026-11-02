// Reserve footer space up front so sticky sidebars keep a stable height on scroll.
(() => {
  const main = document.querySelector('.td-main:has(.td-sidebar)');
  const footer = document.querySelector('.td-footer');
  if (!main || !footer) return;

  // Keep controls on the current page's branch, including its parent categories.
  const currentPath = window.location.pathname.replace(/\/$/, '');
  const currentLink = Array.from(main.querySelectorAll('.td-sidebar-nav a[href]'))
    .find((link) => link.pathname.replace(/\/$/, '') === currentPath);
  main.querySelectorAll('.td-sidebar-nav li.with-child').forEach((entry) => {
    const link = entry.querySelector(':scope > a');
    const children = entry.querySelector(':scope > ul');
    if (!link || !children || !currentLink || !entry.contains(currentLink)) return;

    children.id = entry.id + '-children';
    entry.classList.add('td-sidebar-nav__collapsible');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'td-sidebar-nav__collapse';
    toggle.setAttribute('aria-controls', children.id);
    toggle.innerHTML = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    function setCollapsed(collapsed) {
      children.hidden = collapsed;
      if (!collapsed) {
        // Docsy initially hides entries outside the active path.
        for (const child of children.children) child.classList.remove('collapse');
      }
      toggle.setAttribute('aria-expanded', String(!collapsed));
      const label = (collapsed ? 'Expand ' : 'Collapse ') + link.textContent.trim();
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
    }

    toggle.addEventListener('click', () => {
      setCollapsed(!children.hidden);
    });
    link.after(toggle);
    setCollapsed(!children.querySelector(':scope > li:not(.collapse)'));
  });

  // Keep the full-height sidebar surface separate from its sticky contents.
  const toc = main.querySelector('.td-sidebar-toc');
  if (toc && !toc.querySelector(':scope > .td-sidebar-toc__inner')) {
    const inner = document.createElement('div');
    inner.className = 'td-sidebar-toc__inner';
    while (toc.firstChild) inner.appendChild(toc.firstChild);
    toc.appendChild(inner);
  }

  let frame = 0;
  let previousHeight = -1;

  function update() {
    frame = 0;
    // The final document scroll offset is rounded. Leave one extra pixel beyond
    // the rounded-up footer height so that boundary cannot push either panel up.
    const height = Math.ceil(footer.getBoundingClientRect().height) + 1;
    if (height === previousHeight) return;
    previousHeight = height;
    main.style.setProperty('--sidebar-footer-height', height + 'px');
  }

  function scheduleUpdate() {
    if (!frame) frame = window.requestAnimationFrame(update);
  }

  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate, { once: true });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(footer);
  }
  update();
})();
