// ═══════════════════════════════════════════════════════════
// SIVRAJ.IN v2.0 — Premium Scripts
// Particles, scroll reveals, counters, terminal typing
// ═══════════════════════════════════════════════════════════

// ── Particle System (Canvas) ─────────────────────────────
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    this.init();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const count = Math.min(80, Math.floor(window.innerWidth / 15));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.3 + 0.05,
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(124, 58, 237, ${p.alpha})`;
      this.ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(124, 58, 237, ${0.04 * (1 - dist / 120)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize particles
const pc = document.getElementById('particles-canvas');
if (pc) new ParticleSystem(pc);

// ── Scroll Reveal ───────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Counter Animation ───────────────────────────────────
function animateCounters() {
  document.querySelectorAll('.metric-val').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.closest('.metric')?.querySelector('.metric-label')?.textContent.includes('ms') ? 'ms' : '+';
    const duration = 1200;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + (progress >= 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

const metricsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      metricsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const metricsEl = document.querySelector('.metrics');
if (metricsEl) metricsObserver.observe(metricsEl);

// ── Terminal Typing ─────────────────────────────────────
const termLines = [
  { type: 'cmd', text: 'sivraj --init' },
  { type: 'ok', text: '✓ SIVRAJ v4.0 loaded' },
  { type: 'ok', text: '✓ Wake word: active' },
  { type: 'ok', text: '✓ Vision: ready' },
  { type: 'ok', text: '✓ Firebase relay: connected' },
  { type: 'ok', text: '✓ ESP32: online (sensors active)' },
  { type: 'out', text: '"Good evening, sir. All systems nominal."' },
  { type: 'blank' },
  { type: 'cmd', text: 'sivraj "open chrome and play music"' },
  { type: 'ok', text: '[open:chrome] ✓' },
  { type: 'ok', text: '[url:spotify:lofi-beats] ✓' },
  { type: 'out', text: '"Done. Enjoy your evening."' },
];

async function typeTerminal() {
  const body = document.getElementById('terminalBody');
  if (!body) return;
  body.innerHTML = '';

  for (const line of termLines) {
    const div = document.createElement('div');

    if (line.type === 'blank') {
      div.innerHTML = '&nbsp;';
      body.appendChild(div);
      await sleep(250);
      continue;
    }

    if (line.type === 'cmd') {
      div.innerHTML = `<span class="prompt">~</span> `;
      body.appendChild(div);
      for (const char of line.text) {
        div.innerHTML = `<span class="prompt">~</span> ${div.textContent.replace('~ ', '')}${char}<span class="cursor"></span>`;
        body.scrollTop = body.scrollHeight;
        await sleep(30 + Math.random() * 20);
      }
      div.innerHTML = `<span class="prompt">~</span> ${line.text}`;
      await sleep(350);
    } else if (line.type === 'ok') {
      div.innerHTML = `<span class="ok">${line.text}</span>`;
      body.appendChild(div);
      await sleep(150);
    } else {
      div.innerHTML = `<span class="out">${line.text}</span>`;
      body.appendChild(div);
      await sleep(500);
    }
    body.scrollTop = body.scrollHeight;
  }

  const endDiv = document.createElement('div');
  endDiv.innerHTML = `<span class="prompt">~</span> <span class="cursor"></span>`;
  body.appendChild(endDiv);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const termObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      typeTerminal();
      termObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const term = document.querySelector('.terminal-wrap');
if (term) termObserver.observe(term);

// ── Nav scroll effect ───────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  nav.style.borderBottomColor = window.scrollY > 50
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(255,255,255,0.04)';
});

// ── Orb click ───────────────────────────────────────────
const orb = document.querySelector('.orb-3d');
if (orb) {
  orb.addEventListener('click', () => {
    orb.style.transform = 'scale(0.93)';
    setTimeout(() => { orb.style.transform = 'scale(1.05)'; }, 120);
    setTimeout(() => { orb.style.transform = ''; }, 300);
  });
}
