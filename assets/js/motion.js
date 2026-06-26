// ============================================================================
//  AVEN — Scroll reveal (native IntersectionObserver, transform/opacity only)
//  No animation library. Respects prefers-reduced-motion.
// ============================================================================

// Count-up for [data-count] (text only; fires when the stats band scrolls in).
export function initCounters() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    if (reduce) { el.textContent = target.toFixed(decimals) + suffix; return; }
    const dur = 1300;
    let startTs = null;
    const tick = (ts) => {
      if (startTs === null) startTs = ts;
      const p = Math.min((ts - startTs) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);           // easeOutCubic
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  els.forEach((el) => io.observe(el));
}

export function initReveals() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('[data-reveal]');

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = el.dataset.revealDelay || 0;
      el.style.setProperty('--reveal-delay', `${delay}ms`);
      el.classList.add('is-in');
      obs.unobserve(el); // reveal once, then stop observing
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

  targets.forEach((el) => io.observe(el));
}
