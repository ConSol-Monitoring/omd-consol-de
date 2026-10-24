// Highlight exactly the topmost visible content heading, in either scroll direction.
(() => {
  function initialize() {
    // Prevent Bootstrap's direction-based ScrollSpy from competing with this rule.
    document.querySelectorAll('[data-bs-spy]').forEach(root => {
      if (!(root.getAttribute('data-bs-target') || '').includes('.td-toc')) return;
      root.removeAttribute('data-bs-spy');
      const spy = window.bootstrap?.ScrollSpy.getInstance(root);
      if (spy) spy.dispose();
    });

    const toc = document.getElementById('TableOfContents');
    if (!toc) return;

    const links = Array.from(toc.querySelectorAll('a[href]'));
    const entries = links.flatMap(link => {
      let heading;
      try {
        heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      } catch {
        return [];
      }
      return heading ? [{ link, heading }] : [];
    });
    if (!entries.length) return;

    const navbar = document.querySelector('.td-navbar');
    let activeLink = null;
    let frame = 0;

    function update() {
      frame = 0;
      let top = 0;
      if (navbar) {
        const position = getComputedStyle(navbar).position;
        const rect = navbar.getBoundingClientRect();
        if ((position === 'fixed' || position === 'sticky') && rect.top <= 0) {
          top = Math.max(0, rect.bottom);
        }
      }

      let visible = null;
      let previous = null;
      let upcoming = null;
      for (const entry of entries) {
        const rect = entry.heading.getBoundingClientRect();
        if (rect.height <= 0) continue;

        if (rect.bottom > top && rect.top < window.innerHeight) {
          if (!visible || rect.top < visible.top) visible = { link: entry.link, top: rect.top };
        }
        if (rect.bottom <= top) previous = entry.link;
        else if (!upcoming) upcoming = entry.link;
      }

      // Between headings, retain the preceding section instead of jumping ahead.
      const next = visible?.link || previous || upcoming;
      if (!next || next === activeLink) return;
      activeLink = next;
      for (const link of links) {
        const active = link === next;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('hashchange', scheduleUpdate);
    window.addEventListener('load', scheduleUpdate, { once: true });
    if ('ResizeObserver' in window) {
      new ResizeObserver(scheduleUpdate).observe(document.querySelector('main') || document.body);
    }
    if (document.fonts) document.fonts.ready.then(scheduleUpdate);
    scheduleUpdate();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
