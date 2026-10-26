// Reserve footer space up front so sticky sidebars keep a stable height on scroll.
(() => {
  const main = document.querySelector('.td-main:has(.td-sidebar)');
  const footer = document.querySelector('.td-footer');
  if (!main || !footer) return;

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
