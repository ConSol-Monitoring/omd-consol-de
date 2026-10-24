// Settle at the toolkit after the first downward gesture from the introduction.
// Passive listeners leave wheel/touch momentum and later scrolling to the browser.
document.addEventListener('DOMContentLoaded', function () {
  var toolkit = document.getElementById('projects');
  if (!toolkit) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobileDevice = window.matchMedia('(max-width: 767.98px), (pointer: coarse)');
  var previousY = window.scrollY;
  var armed = !window.location.hash && previousY <= 8;
  var pending = false;
  var settleTimer;

  function targetY() {
    var rootStyle = window.getComputedStyle(document.documentElement);
    var targetStyle = window.getComputedStyle(toolkit);
    var padding = parseFloat(rootStyle.scrollPaddingTop) || 0;
    var margin = parseFloat(targetStyle.scrollMarginTop) || 0;
    return window.scrollY + toolkit.getBoundingClientRect().top - padding - margin;
  }

  function settle() {
    window.clearTimeout(settleTimer);
    if (!pending || !armed || reducedMotion.matches || mobileDevice.matches) return;
    pending = false;

    if (window.scrollY >= targetY() - 2) {
      armed = false;
      return;
    }

    toolkit.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function onScroll() {
    var currentY = window.scrollY;
    var movingDown = currentY > previousY;
    previousY = currentY;
    window.clearTimeout(settleTimer);
    pending = false;

    // Returning to the top enables a new snap; restored positions stay intact.
    if (currentY <= 8) {
      armed = true;
      return;
    }
    if (currentY >= targetY() - 2) {
      armed = false;
      return;
    }
    if (!armed || !movingDown || reducedMotion.matches || mobileDevice.matches) return;

    pending = true;
    // Also handles browsers without scrollend and interrupted smooth scrolling.
    settleTimer = window.setTimeout(settle, 180);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scrollend', settle, { passive: true });
});
