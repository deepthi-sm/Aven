// ============================================================================
//  AVEN — Feature 2: Bento-grid (desktop) ↔ Accordion (mobile)
//
//  Same DOM, two layouts, zero dependencies, no re-mount on breakpoint change.
//
//  INTERACTION MODEL (premium + bug-free):
//    Desktop → detail reveals on :hover / :focus-within (CSS only, transient —
//              never "sticks", so there is no stuck-popup bug). We only TRACK
//              the hovered index in JS for the Context Lock.
//    Mobile  → click toggles an accordion item via `activeIndex` (single-open).
//              Click-outside / Escape closes it.
//
//  CONTEXT LOCK: if the user is hovering bento node N on desktop and the
//  viewport crosses into mobile, that hovered index becomes the open accordion
//  panel — using a shared activeIndex, matchMedia and ResizeObserver.
// ============================================================================

let activeIndex = null;   // open accordion item (mobile)
let hoverIndex = null;    // transient desktop hover (Context-Lock source)
let nodes = [];
let rootEl = null;
const mql = window.matchMedia('(max-width: 768px)');

export function initFeatures(root) {
  if (!root) return;
  rootEl = root;
  nodes = Array.from(root.querySelectorAll('.bento__node'));

  nodes.forEach((node, i) => {
    // CLICK / KEYBOARD → accordion toggle (only meaningful on mobile layout).
    node.addEventListener('click', () => toggle(i));
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); }
    });
    // HOVER (desktop mouse only) → record the Context-Lock source.
    node.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse' && !mql.matches) hoverIndex = i;
    });
    node.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && hoverIndex === i) hoverIndex = null;
    });
  });

  // Dismiss the open accordion on outside-click / Escape.
  document.addEventListener('click', (e) => {
    if (activeIndex !== null && !root.contains(e.target)) setActive(null);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeIndex !== null) setActive(null);
  });

  // CONTEXT LOCK — react to breakpoint crossings (matchMedia).
  mql.addEventListener('change', onBreakpointChange);

  // ResizeObserver keeps the Context-Lock robust across any resize path
  // (devtools, orientation, zoom) without re-mounting the DOM.
  if ('ResizeObserver' in window) {
    let wasMobile = mql.matches;
    new ResizeObserver(() => {
      const isMobile = mql.matches;
      if (isMobile !== wasMobile) { applyContextLock(isMobile); wasMobile = isMobile; }
    }).observe(document.documentElement);
  }

  render();
}

function toggle(i) {
  // On desktop the reveal is hover/focus-driven (CSS); a click simply pins the
  // accordion target so the Context Lock has an explicit index if needed.
  setActive(i === activeIndex ? null : i);
}

function setActive(i) { activeIndex = i; render(); }

function onBreakpointChange(e) { applyContextLock(e.matches); }

function applyContextLock(isMobile) {
  // Entering mobile with no open item but an active desktop hover → transfer it.
  if (isMobile && activeIndex === null && hoverIndex !== null) activeIndex = hoverIndex;
  // Leaving mobile → desktop reveal is hover-based, so drop the pinned state.
  if (!isMobile) activeIndex = null;
  render();
}

// Single render pass: reflect state onto the shared nodes (class + ARIA only).
function render() {
  nodes.forEach((node, i) => {
    const on = i === activeIndex;
    node.classList.toggle('is-active', on);
    node.setAttribute('aria-expanded', String(on));
  });
}
