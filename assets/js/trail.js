// ============================================================================
//  AVEN — Cursor trail + stardust
//  A single fixed canvas. Mouse move leaves a faint gold trail; touch-drag
//  bursts brighter stardust (the mobile interaction). Particle count is capped
//  and the loop pauses when the tab is hidden. transform/opacity-class motion
//  elsewhere is untouched; this is an isolated decorative overlay.
//  Honors prefers-reduced-motion (no-op).
// ============================================================================

export function initTrail() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '60',
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLORS = ['255,200,1', '255,153,50', '241,246,244'];
  const CAP = 170;
  const ps = [];

  function spawn(x, y, n, spread) {
    for (let i = 0; i < n; i++) {
      ps.push({
        x, y,
        vx: (Math.random() - 0.5) * spread,
        vy: (Math.random() - 0.5) * spread - 0.25,
        life: 1,
        size: Math.random() * 1.8 + 0.8,
        c: COLORS[(Math.random() * COLORS.length) | 0],
      });
    }
    if (ps.length > CAP) ps.splice(0, ps.length - CAP);
  }

  window.addEventListener('pointermove', (e) => {
    const touch = e.pointerType !== 'mouse';
    spawn(e.clientX, e.clientY, touch ? 4 : 1, touch ? 2.6 : 1.15);
  }, { passive: true });

  // a little extra burst when a touch starts (tap/drag feedback)
  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') spawn(e.clientX, e.clientY, 10, 3.4);
  }, { passive: true });

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(loop);
  });

  function loop() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.012; p.life -= 0.022;
      if (p.life <= 0) { ps.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.c},${p.life * 0.85})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(${p.c},${p.life})`;
      ctx.arc(p.x, p.y, p.size, 0, 6.283);
      ctx.fill();
    }
    if (running) requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
