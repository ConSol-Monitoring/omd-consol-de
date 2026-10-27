// Highlight the first article visible below the navigation on the date timeline.
(() => {
  function initialize() {
    const main = document.querySelector('.td-section.td-blog main');
    if (!main) return;
    let frame = 0;
    let active = null;

    function update() {
      frame = 0;
      const offset = (document.querySelector('.td-navbar')?.offsetHeight || 0) + 24;
      const current = [...main.querySelectorAll('.td-blog-posts-list__item')].find(card => {
        if (!card.getClientRects().length) return false;
        const rect = card.getBoundingClientRect();
        return rect.bottom > offset && rect.top < innerHeight;
      }) || null;
      if (active === current) return;
      active?.classList.remove('is-timeline-current');
      active?.removeAttribute('aria-current');
      current?.classList.add('is-timeline-current');
      current?.setAttribute('aria-current', 'location');
      active = current;
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule, { once: true });
    new ResizeObserver(schedule).observe(main);
    new MutationObserver(schedule).observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    document.fonts?.ready.then(schedule);
    schedule();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
