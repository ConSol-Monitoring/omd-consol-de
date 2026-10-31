// This is an information notice. Dismissing it does not enable any services.
(() => {
  const notice = document.getElementById('storage-notice');
  const dismiss = document.getElementById('storage-notice-dismiss');
  if (!notice || !dismiss) return;

  const key = 'monitoring-storage-notice-v1';
  try {
    if (localStorage.getItem(key) === 'dismissed') return;
  } catch (_) {
    // The notice and site still work when browser storage is disabled.
  }
  notice.hidden = false;
  dismiss.addEventListener('click', () => {
    try {
      localStorage.setItem(key, 'dismissed');
    } catch (_) {}
    notice.hidden = true;
    // Keep keyboard focus in the document when its button disappears.
    document.querySelector('.monitoring-footer__navigation a[data-storage-details]')?.focus({ preventScroll: true });
  });
})();
