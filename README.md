# AVEN, AI Data Automation Platform

A premium, responsive landing page for **Aven**, an autonomous AI data-automation platform.
Built for a strict engineering rubric: matrix-driven pricing with isolated state updates, a
zero-dependency Bento↔Accordion that survives layout changes, semantic SEO-first markup, and a
sub-500ms entry, all in **vanilla JS + custom CSS, no build step, no UI/animation libraries**.

## Live demo
> Deployed via GitHub Pages, see the repository's **Pages** environment.

## Stack
- **Vanilla JavaScript** (native ES modules), no framework
- **Custom CSS** (CSS variables), no Tailwind/Bootstrap, no component libraries
- **No build tools**, open `index.html` or serve the folder statically
- Self-hosted **JetBrains Mono** + **Inter** (woff2, latin subset)

## Core features
### 1. Matrix-driven pricing (performance-isolated)
Prices are computed from a single configuration matrix:

```
price = baseMonthlyUSD × billing.months × billing.discount × fx.rate
```

Switching **currency (INR / USD / EUR)** or **billing (Monthly / Annual)** patches **only the
individual price text nodes** (via `data-price-*` references), no parent re-render, no layout
reflow. Verified with Chrome DevTools paint-flashing.

### 2. Bento → Accordion (zero dependency, state-persistent)
One DOM, two layouts. A desktop asymmetrical **bento grid** becomes a touch **accordion** on
mobile. A shared `activeIndex` plus `matchMedia` + `ResizeObserver` carry the active/hovered card
across the breakpoint, no re-mounting, written from scratch.

## Motion
Hardware-accelerated `transform` / `opacity` / `filter` only. Micro-interactions 150–200ms
(ease-out); structural transitions 300–400ms (ease-in-out); entry orchestration completes < 500ms.
Respects `prefers-reduced-motion`.

## Run locally
```bash
# any static server works, e.g.
npx serve .
# then open http://localhost:3000
```

## Project structure
```
index.html
assets/
  css/   fonts.css · styles.css
  js/    main.js · pricing.js · features.js · motion.js · data.js
  icons/ provided UI SVGs
  fonts/ self-hosted woff2
  og/    social image
robots.txt · sitemap.xml
```

## License
© Aven Labs. All rights reserved.
