// ============================================================================
//  AVEN — Application bootstrap
//  Static HTML holds all content; JS wires behaviour + the ≤500ms entry.
// ============================================================================

import { initPricing, refreshPricingThumbs } from './pricing.js';
import { initFeatures } from './features.js';
import { initReveals, initCounters } from './motion.js';
import { initHeroViz } from './hero-viz.js';

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

// Magnetic buttons — cursor pulls the button up to ~5px (mouse only).
function initMagnetic() {
  if (window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = btn.getBoundingClientRect();
      const x = Math.max(-5, Math.min(5, (e.clientX - (r.left + r.width / 2)) * 0.3));
      const y = Math.max(-5, Math.min(5, (e.clientY - (r.top + r.height / 2)) * 0.3));
      btn.style.transform = `translate(${x}px,${y}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

// Orbital parallax — the hero visual drifts a few px toward the cursor (lerped).
function initParallax() {
  const el = $('.hero__visual');
  if (!el || window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    tx = (e.clientX / window.innerWidth - 0.5) * 18;
    ty = (e.clientY / window.innerHeight - 0.5) * 18;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  function loop() {
    cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
    el.style.transform = `translate(${cx.toFixed(2)}px,${cy.toFixed(2)}px)`;
    raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : null;
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
  initMagnetic();
  runEntryOrchestration();

  // Signature hero visual: lazy, AFTER the page is interactive — never on the
  // critical load path. Static SVG fallback is already visible.
  const startViz = () => (window.requestIdleCallback || ((f) => setTimeout(f, 200)))(initHeroViz);
  if (document.readyState === 'complete') startViz();
  else window.addEventListener('load', startViz, { once: true });

  // marquee direction controls (chevron-left / chevron-right)
  const marquee = $('.marquee');
  $('#mq-prev')?.addEventListener('click', () => marquee?.classList.add('marquee--rev'));
  $('#mq-next')?.addEventListener('click', () => marquee?.classList.remove('marquee--rev'));

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
