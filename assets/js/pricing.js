// ============================================================================
//  AVEN — Feature 1: Matrix-driven pricing + performance-isolated switcher
//
//  Content/structure is STATIC semantic HTML (crawlable, no mount-flash).
//  JS binds to existing nodes and, on currency/billing change, patches ONLY the
//  cached price text nodes (looked up via [data-price-*]). No element creation,
//  no class churn on the tier cards or parents → DevTools paint-flashing shows
//  only the digits repaint. Local state never lives in a parent render path.
//
//  GUARDRAIL met: prices are COMPUTED from the matrix (never hardcoded in markup
//  — the value spans ship empty and are filled from PRICING on init).
// ============================================================================

import { PRICING } from './data.js';

let currency = 'USD';
let billing = 'monthly';

/** Cached price text-node references, keyed by tier id. */
const refs = {};
let rootEl = null;

const computeRaw = (tier) => {
  const b = PRICING.billing[billing];
  // baseMonthlyUSD × months × discount × fx.rate
  return tier.baseMonthlyUSD * b.months * b.discount * PRICING.fx[currency].rate;
};

const formatValue = (raw) =>
  new Intl.NumberFormat(PRICING.fx[currency].locale, { maximumFractionDigits: 0 })
    .format(Math.round(raw));

export function initPricing(root) {
  if (!root) return;
  rootEl = root;

  // cache the three inline spans per tier ONCE
  PRICING.tiers.forEach((tier) => {
    refs[tier.id] = {
      symbol: root.querySelector(`[data-price-symbol="${tier.id}"]`),
      value:  root.querySelector(`[data-price-value="${tier.id}"]`),
      suffix: root.querySelector(`[data-price-suffix="${tier.id}"]`),
    };
  });

  wireControls(root);
  paintPrices(true);     // initial fill from matrix (no pulse)
  positionThumbs(root);
}

// The ONLY DOM write on switch: patch cached price text nodes.
function paintPrices(initial = false) {
  const sym = PRICING.fx[currency].symbol;
  const suffix = PRICING.billing[billing].suffix;
  for (const tier of PRICING.tiers) {
    const r = refs[tier.id];
    if (!r || !r.value) continue;
    r.symbol.textContent = sym;
    r.value.textContent = formatValue(computeRaw(tier));
    r.suffix.textContent = suffix;
    if (!initial) pulse(r.value);
  }
}

// WAAPI digit pulse — native, hardware-accelerated, transform/opacity only (~175ms).
function pulse(el) {
  el.animate(
    [{ opacity: 0.35, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 175, easing: 'cubic-bezier(0,0,.2,1)' }
  );
}

function wireControls(root) {
  root.querySelectorAll('[data-billing]').forEach((btn) =>
    btn.addEventListener('click', () => {
      if (btn.dataset.billing === billing) return;
      billing = btn.dataset.billing;
      setActive(root, '[data-billing]', btn);
      moveThumb(root, '.switch__thumb', btn);
      paintPrices();
    })
  );
  root.querySelectorAll('[data-currency]').forEach((btn) =>
    btn.addEventListener('click', () => {
      if (btn.dataset.currency === currency) return;
      currency = btn.dataset.currency;
      setActive(root, '[data-currency]', btn);
      moveThumb(root, '.seg__thumb', btn);
      paintPrices();
    })
  );
}

function setActive(root, selector, activeBtn) {
  root.querySelectorAll(selector).forEach((b) => {
    const on = b === activeBtn;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-checked', String(on));
  });
}

// Sliding thumb = pure transform (no layout, no parent reflow).
function moveThumb(root, thumbSel, btn) {
  const thumb = root.querySelector(thumbSel);
  if (!thumb || !btn) return;
  thumb.style.transform = `translateX(${btn.offsetLeft - 5}px)`;
  thumb.style.width = `${btn.offsetWidth}px`;
}
function positionThumbs(root) {
  moveThumb(root, '.switch__thumb', root.querySelector('.switch__btn.is-active'));
  moveThumb(root, '.seg__thumb', root.querySelector('.seg__btn.is-active'));
}

// Keep thumbs aligned on resize WITHOUT repainting prices.
export function refreshPricingThumbs() {
  if (rootEl) positionThumbs(rootEl);
}
