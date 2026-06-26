// ============================================================================
//  AVEN — Application bootstrap
//  Static HTML holds all content; JS wires behaviour + the ≤500ms entry.
// ============================================================================

import { initPricing, refreshPricingThumbs } from './pricing.js';
import { initFeatures } from './features.js';
import { initReveals, initCounters } from './motion.js';

const $ = (s, r = document) => r.querySelector(s);

function initNav() {
  const nav = $('#nav');
  const toggle = $('#nav-toggle');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('.nav__link').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }
}

function runEntryOrchestration() {
  // Content is already parsed in the DOM; the loader is a non-blocking overlay.
  requestAnimationFrame(() => {
    document.body.classList.add('is-loaded');     // triggers hero stagger via CSS
    const loader = $('#loader');
    if (loader) {
      setTimeout(() => loader.classList.add('is-done'), 60);  // done well within 500ms
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }
  });
}

function init() {
  initFeatures($('#bento'));
  initPricing($('#pricing-app'));
  initNav();
  initReveals();
  initCounters();
  runEntryOrchestration();

  const yr = $('#year');
  if (yr) yr.textContent = String(new Date().getFullYear());

  let raf;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(refreshPricingThumbs);
  }, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
