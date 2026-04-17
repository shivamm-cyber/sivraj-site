// ═══════════════════════════════════════════════════════════
// SIVRAJ.IN — Landing Page Scripts
// Scroll reveal, counter animation, terminal typing
// ═══════════════════════════════════════════════════════════

// ── Scroll Reveal ───────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Counter Animation ───────────────────────────────────
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 1500;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + '+';
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// Trigger counters when hero stats become visible
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

// ── Terminal Typing Animation ───────────────────────────
const terminalLines = [
  { type: 'cmd',    text: 'sivraj --start' },
  { type: 'action', text: '⚡ SIVRAJ v4.0 online' },
  { type: 'action', text: '🎤 Wake word detection: active' },
  { type: 'action', text: '👁️ Screen vision: ready' },
  { type: 'action', text: '🧠 LLM: groq/llama-3.3-70b' },
  { type: 'action', text: '📡 ESP32: connected (room sensors online)' },
  { type: 'resp',   text: '"Good evening, sir. All systems operational."' },
  { type: 'blank',  text: '' },
  { type: 'cmd',    text: 'sivraj "open chrome and play some music"' },
  { type: 'action', text: '[ACTION:open:chrome] ✓' },
  { type: 'action', text: '[ACTION:url:spotify:search:lo-fi beats] ✓' },
  { type: 'resp',   text: '"Chrome and Spotify are up. You are welcome."' },
];

async function typeTerminal() {
  const body = document.getElementById('terminalBody');
  if (!body) return;
  body.innerHTML = '';

  for (const line of terminalLines) {
    const div = document.createElement('div');

    if (line.type === 'blank') {
      div.innerHTML = '&nbsp;';
      body.appendChild(div);
      await sleep(300);
      continue;
    }

    if (line.type === 'cmd') {
      div.innerHTML = `<span class="prompt">shivam@sivraj ~$</span> `;
      body.appendChild(div);
      // Type character by character
      for (const char of line.text) {
        div.innerHTML = `<span class="prompt">shivam@sivraj ~$</span> ${div.textContent.replace('shivam@sivraj ~$ ', '')}${char}<span class="cursor"></span>`;
        body.scrollTop = body.scrollHeight;
        await sleep(35 + Math.random() * 25);
      }
      // Remove cursor after typing
      div.innerHTML = `<span class="prompt">shivam@sivraj ~$</span> ${line.text}`;
      await sleep(400);
    } else if (line.type === 'action') {
      div.innerHTML = `<span class="action">${line.text}</span>`;
      body.appendChild(div);
      await sleep(200);
    } else {
      div.innerHTML = `<span class="response">${line.text}</span>`;
      body.appendChild(div);
      await sleep(600);
    }

    body.scrollTop = body.scrollHeight;
  }

  // Add blinking cursor at end
  const cursorDiv = document.createElement('div');
  cursorDiv.innerHTML = `<span class="prompt">shivam@sivraj ~$</span> <span class="cursor"></span>`;
  body.appendChild(cursorDiv);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Start terminal when section is visible
const termObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      typeTerminal();
      termObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const terminal = document.querySelector('.terminal');
if (terminal) termObserver.observe(terminal);

// ── Smooth nav background on scroll ─────────────────────
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(6, 6, 14, 0.95)';
  } else {
    nav.style.background = 'rgba(6, 6, 14, 0.8)';
  }
});

// ── Orb click interaction ────────────────────────────────
const heroOrb = document.querySelector('.hero-orb');
if (heroOrb) {
  heroOrb.addEventListener('click', () => {
    heroOrb.style.transition = 'transform 0.15s ease';
    heroOrb.style.transform = 'scale(0.92)';
    setTimeout(() => {
      heroOrb.style.transform = 'scale(1.05)';
      setTimeout(() => { heroOrb.style.transform = ''; }, 200);
    }, 150);
  });
}
