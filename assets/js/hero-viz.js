// ============================================================================
//  AVEN — Signature hero visual: animated pipeline / network graph.
//
//  A static SVG graph (edges) + HTML icon nodes render immediately as the
//  fallback. This module ENHANCES that with a Canvas overlay: data packets
//  flow along the edges, an edge occasionally "breaks" and reroutes (a literal
//  self-healing-pipeline beat matching the copy), and the whole field drifts
//  toward the cursor.
//
//  Zero dependencies. Lazy-initialised on load/idle so it never blocks the
//  500ms entry budget or TTI. Skipped under reduced-motion and on small screens
//  (the static SVG fallback stays visible). Palette-only colours.
// ============================================================================

// Node positions in % of the visual box (shared with the static SVG/HTML).
const NODES = [
  [15, 28], [40, 14], [68, 24], [27, 56], [55, 64], [83, 46], [48, 40],
];
// Edges as node-index pairs (must match the <line>s in the static SVG).
const EDGES = [
  [0, 1], [1, 2], [0, 6], [6, 3], [6, 2], [6, 4], [4, 5], [2, 5], [0, 3], [3, 4],
];

export function initHeroViz() {
  const wrap = document.querySelector('.hero__viz');
  const canvas = wrap && wrap.querySelector('.hero__canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 760px)').matches) return; // static fallback only

  const ctx = canvas.getContext('2d');
  const edgeEls = wrap.querySelectorAll('.hero__edges .edge');
  let W = 0, H = 0;

  const resize = () => {
    const r = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const pt = (n) => [NODES[n][0] / 100 * W, NODES[n][1] / 100 * H];

  // one packet per edge, looping along it
  const packets = EDGES.map((_, i) => ({ e: i, t: Math.random(), sp: 0.0015 + Math.random() * 0.0016 }));

  let broken = -1, healAt = 0, nextBreak = 4000;

  // cursor drift (listener on the hero section so the pointer-events:none visual
  // still reacts)
  let mx = 0, my = 0, dx = 0, dy = 0;
  const hero = wrap.closest('.hero') || wrap;
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = hero.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * -16;
    my = ((e.clientY - r.top) / r.height - 0.5) * -16;
  }, { passive: true });

  function frame(ts) {
    // drift (lerped) applied to nodes + edges + canvas via a CSS var
    dx += (mx - dx) * 0.05; dy += (my - dy) * 0.05;
    wrap.style.setProperty('--drift-x', dx.toFixed(2) + 'px');
    wrap.style.setProperty('--drift-y', dy.toFixed(2) + 'px');

    // self-healing: break an edge, then heal it ~1.6s later
    if (broken < 0 && ts > nextBreak) {
      broken = (Math.random() * EDGES.length) | 0;
      edgeEls[broken] && edgeEls[broken].classList.add('is-broken');
      healAt = ts + 1600;
    } else if (broken >= 0 && ts > healAt) {
      edgeEls[broken] && edgeEls[broken].classList.remove('is-broken');
      broken = -1;
      nextBreak = ts + 3500 + Math.random() * 3000;
    }

    ctx.clearRect(0, 0, W, H);
    for (const p of packets) {
      p.t += p.sp;
      if (p.t > 1) p.t -= 1;
      if (p.e === broken) continue; // rerouted: nothing flows on a broken edge
      const [a, b] = EDGES[p.e];
      const [ax, ay] = pt(a), [bx, by] = pt(b);
      const x = ax + (bx - ax) * p.t, y = ay + (by - ay) * p.t;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,200,1,.9)';
      ctx.shadowBlur = 7;
      ctx.shadowColor = 'rgba(255,200,1,.6)';
      ctx.arc(x, y, 2.1, 0, 6.283);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
