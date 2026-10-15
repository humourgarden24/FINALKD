// Kaal Darpan cover: particle field, data-driven parallax, title entrance, Peek burst, museum portal.

const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionQuery.matches;

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (list) => list[(Math.random() * list.length) | 0];

// ---------- Museum entry ----------
// The museum URL lives in one place: the href of the [data-museum-link] CTA in index.html.
const museumCta = document.querySelector('[data-museum-link]');
const MUSEUM_URL = museumCta.getAttribute('href');
const portal = document.getElementById('portal');

museumCta.addEventListener('click', (event) => {
  if (reducedMotion || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const rect = museumCta.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  portal.style.setProperty('--px', `${x}px`);
  portal.style.setProperty('--py', `${y}px`);
  portal.classList.add('open');
  burst(x, y, 140, 7);
  setTimeout(() => { window.location.href = MUSEUM_URL; }, 700);
});
// Reset the portal if the user navigates back (bfcache restore).
addEventListener('pageshow', () => portal.classList.remove('open'));

// ---------- Title split + entrance ----------
const title = document.querySelector('.title');
{
  const words = title.textContent.trim().split(/\s+/);
  let index = 0;
  title.textContent = '';
  title.style.setProperty('--n', words.join('').length);
  words.forEach((word, w) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    wordEl.setAttribute('aria-hidden', 'true');
    for (const ch of word) {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      span.style.setProperty('--i', index++);
      wordEl.appendChild(span);
    }
    title.appendChild(wordEl);
    if (w < words.length - 1) title.appendChild(document.createTextNode(' '));
  });
  title.classList.add('is-split');

  const entranceMs = 250 + index * 75 + 1200;
  setTimeout(() => {
    title.classList.add('entered');
    const shine = () => {
      if (reducedMotion || document.hidden) return;
      title.classList.remove('shine');
      void title.offsetWidth;
      title.classList.add('shine');
    };
    shine();
    setInterval(shine, 6500);
  }, entranceMs);
}

// ---------- Canvas particle field ----------
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
const PALETTE = [
  [255, 215, 122], // gold
  [255, 159, 67],  // amber
  [255, 79, 163],  // rose / neon magenta
  [54, 241, 224],  // teal neon
  [138, 123, 255], // indigo-violet
  [246, 231, 200], // ivory
];
const LINK_DIST = 120;
const MAX_SPARKS = 700;

let width = 0;
let height = 0;
let dpr = 1;
let nodes = [];
let motes = [];
const sparks = [];
const rings = [];
const trail = [];

// Pre-rendered glow sprite for dust motes (avoids a gradient allocation per mote per frame).
const moteSprite = document.createElement('canvas');
{
  const size = 64;
  moteSprite.width = moteSprite.height = size;
  const sctx = moteSprite.getContext('2d');
  const g = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,240,200,1)');
  g.addColorStop(0.25, 'rgba(255,215,122,0.7)');
  g.addColorStop(1, 'rgba(255,170,70,0)');
  sctx.fillStyle = g;
  sctx.fillRect(0, 0, size, size);
}

function makeNode() {
  return {
    x: rand(0, width), y: rand(0, height),
    vx: rand(-0.22, 0.22), vy: rand(-0.18, 0.18),
    r: rand(0.8, 2.2), c: pick(PALETTE),
  };
}
function makeMote(y = rand(0, height)) {
  return {
    x: rand(0, width), y,
    vy: rand(-0.35, -0.08), sway: rand(0.2, 0.8), phase: rand(0, Math.PI * 2),
    r: rand(0.6, 1.8), tw: rand(0.6, 2.2),
  };
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = innerWidth;
  height = innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const area = width * height;
  const nodeCount = Math.max(28, Math.min(110, Math.round(area / 15000)));
  const moteCount = Math.max(18, Math.min(60, Math.round(area / 30000)));
  while (nodes.length < nodeCount) nodes.push(makeNode());
  nodes.length = nodeCount;
  while (motes.length < moteCount) motes.push(makeMote());
  motes.length = moteCount;
  for (const n of nodes) { n.x = Math.min(n.x, width); n.y = Math.min(n.y, height); }
  if (reducedMotion) drawFrame(performance.now(), false);
}

function burst(x, y, count, power) {
  for (let i = 0; i < count && sparks.length < MAX_SPARKS; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(0.3, 1) * power;
    sparks.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      r: rand(0.8, 3.2), life: rand(50, 110), age: 0, c: pick(PALETTE),
    });
  }
}

const pointer = { x: innerWidth / 2, y: innerHeight / 2, sx: innerWidth / 2, sy: innerHeight / 2, active: false, last: 0 };

function drawFilaments(t) {
  const strands = [
    { base: 0.32, amp: 46, f: 0.0042, s: 0.00022, c0: 'rgba(255,215,122,', c1: 'rgba(255,79,163,' },
    { base: 0.55, amp: 64, f: 0.0031, s: -0.00017, c0: 'rgba(54,241,224,', c1: 'rgba(138,123,255,' },
    { base: 0.74, amp: 38, f: 0.0053, s: 0.00027, c0: 'rgba(255,159,67,', c1: 'rgba(54,241,224,' },
  ];
  ctx.lineWidth = 1.1;
  for (const st of strands) {
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, `${st.c0}0)`);
    grad.addColorStop(0.3, `${st.c0}0.22)`);
    grad.addColorStop(0.7, `${st.c1}0.22)`);
    grad.addColorStop(1, `${st.c1}0)`);
    ctx.strokeStyle = grad;
    for (let k = 0; k < 2; k++) {
      ctx.beginPath();
      for (let x = -20; x <= width + 20; x += 18) {
        const y = height * st.base
          + Math.sin(x * st.f + t * st.s * 6 + k * 0.6) * st.amp
          + Math.sin(x * st.f * 2.3 - t * st.s * 4) * st.amp * 0.35
          + k * 8;
        if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}

function drawFrame(t, step) {
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'lighter';

  drawFilaments(t);

  // network nodes + connecting lines
  for (const n of nodes) {
    if (step) {
      const dx = n.x - pointer.sx;
      const dy = n.y - pointer.sy;
      const d2 = dx * dx + dy * dy;
      if (pointer.active && d2 < 22500) {
        const f = (1 - d2 / 22500) * 0.06;
        n.vx += dx * f * 0.02;
        n.vy += dy * f * 0.02;
      }
      n.vx = Math.max(-0.8, Math.min(0.8, n.vx * 0.995));
      n.vy = Math.max(-0.8, Math.min(0.8, n.vy * 0.995));
      n.x += n.vx; n.y += n.vy;
      if (n.x < -10) n.x = width + 10; else if (n.x > width + 10) n.x = -10;
      if (n.y < -10) n.y = height + 10; else if (n.y > height + 10) n.y = -10;
    }
  }
  ctx.lineWidth = 0.7;
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      const dx = a.x - b.x;
      if (dx > LINK_DIST || dx < -LINK_DIST) continue;
      const dy = a.y - b.y;
      if (dy > LINK_DIST || dy < -LINK_DIST) continue;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < LINK_DIST) {
        ctx.strokeStyle = `rgba(${a.c[0]},${a.c[1]},${a.c[2]},${(1 - d / LINK_DIST) * 0.28})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
  }
  for (const n of nodes) {
    ctx.fillStyle = `rgba(${n.c[0]},${n.c[1]},${n.c[2]},0.85)`;
    ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
  }

  // golden dust motes with twinkle
  for (const m of motes) {
    if (step) {
      m.y += m.vy;
      m.x += Math.sin(t * 0.0006 * m.sway + m.phase) * 0.25;
      if (m.y < -10) Object.assign(m, makeMote(height + 10));
    }
    const tw = Math.sin(t * 0.001 * m.tw + m.phase);
    const alpha = 0.25 + 0.75 * tw * tw;
    const size = m.r * 12;
    ctx.globalAlpha = alpha;
    ctx.drawImage(moteSprite, m.x - size / 2, m.y - size / 2, size, size);
    ctx.globalAlpha = 1;
    if (alpha > 0.85) {
      const s = m.r * 7;
      ctx.strokeStyle = `rgba(255,240,200,${(alpha - 0.85) * 5})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(m.x - s, m.y); ctx.lineTo(m.x + s, m.y); ctx.moveTo(m.x, m.y - s); ctx.lineTo(m.x, m.y + s); ctx.stroke();
    }
  }

  // burst sparks
  for (let i = sparks.length - 1; i >= 0; i--) {
    const p = sparks[i];
    if (step) {
      p.age++; p.x += p.vx; p.y += p.vy; p.vx *= 0.955; p.vy = p.vy * 0.955 + 0.02;
    }
    const life = 1 - p.age / p.life;
    if (life <= 0) { sparks.splice(i, 1); continue; }
    ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${life})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.5 + life * 0.5), 0, Math.PI * 2); ctx.fill();
  }

  // shockwave rings (Peek)
  for (let i = rings.length - 1; i >= 0; i--) {
    const ring = rings[i];
    if (step) ring.age++;
    const k = ring.age / ring.life;
    if (k >= 1) { rings.splice(i, 1); continue; }
    if (k <= 0) continue;
    const ease = 1 - (1 - k) ** 3;
    ctx.strokeStyle = `rgba(${ring.c},${(1 - k) * 0.8})`;
    ctx.lineWidth = 2.5 * (1 - k) + 0.5;
    ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.max * ease, 0, Math.PI * 2); ctx.stroke();
  }

  // glowing cursor trail
  if (trail.length > 1) {
    for (let i = 1; i < trail.length; i++) {
      const k = i / trail.length;
      ctx.strokeStyle = `rgba(255,${180 + k * 60 | 0},${120 + k * 80 | 0},${k * 0.55})`;
      ctx.lineWidth = k * 6;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke();
    }
  }

  ctx.globalCompositeOperation = 'source-over';
}

// ---------- Data-driven parallax ----------
// Any element with data-depth moves with the pointer; larger depth = closer to the viewer.
const layers = [...document.querySelectorAll('[data-depth]')].map((el) => ({
  el,
  depth: parseFloat(el.dataset.depth) || 0,
  svg: el instanceof SVGElement && !(el instanceof SVGSVGElement),
}));

function applyParallax(nx, ny) {
  for (const { el, depth, svg } of layers) {
    const tx = -nx * depth * 30;
    const ty = -ny * depth * 20;
    const rot = nx * depth * (svg ? 1 : 2);
    el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
  }
}

// ---------- Cursor orb ----------
const orb = document.createElement('div');
orb.className = 'cursor-orb';
orb.setAttribute('aria-hidden', 'true');
document.body.appendChild(orb);

addEventListener('pointermove', (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.last = performance.now();
  if (event.pointerType === 'mouse') {
    pointer.active = true;
    orb.classList.add('active');
  }
  if (!reducedMotion && Math.random() < 0.35) {
    burst(event.clientX, event.clientY, 1, 1.2);
  }
}, { passive: true });
document.addEventListener('pointerleave', () => { pointer.active = false; orb.classList.remove('active'); });

// ---------- Main loop ----------
let rafId = 0;
let nx = 0;
let ny = 0;

function loop(t) {
  rafId = requestAnimationFrame(loop);
  const idle = t - pointer.last > 3500;
  const tx = idle ? Math.sin(t * 0.00025) * width * 0.18 + width / 2 : pointer.x;
  const ty = idle ? Math.cos(t * 0.0002) * height * 0.12 + height / 2 : pointer.y;
  pointer.sx += (tx - pointer.sx) * 0.08;
  pointer.sy += (ty - pointer.sy) * 0.08;

  nx += ((pointer.sx - width / 2) / (width / 2) - nx) * 0.08;
  ny += ((pointer.sy - height / 2) / (height / 2) - ny) * 0.08;
  applyParallax(nx, ny);

  if (pointer.active && !idle) {
    trail.push({ x: pointer.sx, y: pointer.sy });
    orb.style.transform = `translate3d(${pointer.sx}px, ${pointer.sy}px, 0)`;
  } else if (trail.length) {
    trail.shift();
  }
  if (trail.length > 22) trail.shift();

  drawFrame(t, true);
}

function start() {
  cancelAnimationFrame(rafId);
  if (reducedMotion) {
    applyParallax(0, 0);
    trail.length = 0;
    drawFrame(performance.now(), false);
  } else {
    rafId = requestAnimationFrame(loop);
  }
}

motionQuery.addEventListener('change', (event) => { reducedMotion = event.matches; start(); });
addEventListener('resize', resize);
resize();
start();

// ---------- Peek: bloom burst + screen glow ----------
const peekBtn = document.getElementById('peekBtn');
const screenGlow = document.getElementById('screenGlow');
let peekTimer = 0;

peekBtn.addEventListener('click', () => {
  const rect = peekBtn.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const titleRect = title.getBoundingClientRect();
  const tx = titleRect.left + titleRect.width / 2;
  const ty = titleRect.top + titleRect.height / 2;

  document.body.classList.add('peeking');
  clearTimeout(peekTimer);
  peekTimer = setTimeout(() => document.body.classList.remove('peeking'), 1400);

  if (reducedMotion) return;

  burst(x, y, 220, 9);
  burst(tx, ty, 160, 6);
  const ringMax = Math.max(width, height) * 0.6;
  rings.push({ x, y, max: ringMax, life: 70, age: 0, c: '255,215,122' });
  rings.push({ x, y, max: ringMax * 0.7, life: 85, age: -8, c: '54,241,224' });
  rings.push({ x: tx, y: ty, max: ringMax * 0.5, life: 90, age: -4, c: '255,79,163' });

  screenGlow.style.setProperty('--gx', `${x}px`);
  screenGlow.style.setProperty('--gy', `${y}px`);
  screenGlow.classList.remove('flash');
  void screenGlow.offsetWidth;
  screenGlow.classList.add('flash');
});
