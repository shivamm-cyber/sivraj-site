// ═══════════════════════════════════════════════════════════════
// SIVRAJ CIC — Shared App Shell
// ═══════════════════════════════════════════════════════════════

// ─── AUTH GUARD — runs before anything else ──────────────────
// Every page that loads app.js is protected.
// login.html does NOT load app.js, so it's not affected.
(function authGuard() {
  // auth.js must be loaded before app.js for this to work,
  // but as a fallback, check localStorage directly
  if (typeof isAuthenticated === 'function') {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      document.documentElement.style.display = 'none';
      return;
    }
  } else {
    // Fallback: check session directly
    try {
      const raw = localStorage.getItem('sivraj_auth_session');
      if (!raw) { window.location.href = '/login'; document.documentElement.style.display = 'none'; return; }
      const s = JSON.parse(raw);
      if (Date.now() > s.expiresAt) { localStorage.removeItem('sivraj_auth_session'); window.location.href = '/login'; document.documentElement.style.display = 'none'; return; }
    } catch { window.location.href = '/login'; document.documentElement.style.display = 'none'; return; }
  }
})();

const SIVRAJ_API = 'http://localhost:3000/api';
const PAGES = [
  { id:'dashboard', icon:'◆', label:'Dashboard', href:'/' },
  { id:'ops', icon:'🎯', label:'Operations', href:'/ops' },
  { id:'targets', icon:'📋', label:'Targets', href:'/targets' },
  { id:'tools', icon:'🔧', label:'Tools (54)', href:'/tools', section:'ARSENAL' },
  { id:'workflows', icon:'⚡', label:'Workflows', href:'/workflows' },
  { id:'findings', icon:'🚩', label:'Findings', href:'/findings', badge:true },
  { id:'reports', icon:'📊', label:'Reports', href:'/reports' },
  { id:'logs', icon:'📜', label:'Logs', href:'/logs', section:'SYSTEM' },
  { id:'hardware', icon:'📡', label:'Hardware', href:'/hardware' },
  { id:'terminal', icon:'▸', label:'Terminal', href:'/terminal' },
  { id:'settings', icon:'⚙', label:'Settings', href:'/settings' },
  { id:'remote', icon:'🌐', label:'Remote', href:'/remote.html' },
];

function getCurrentPage() {
  const path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  return PAGES.find(p => p.href === path)?.id || 'dashboard';
}

function renderSidebar() {
  const current = getCurrentPage();
  const sb = document.getElementById('appSidebar');
  if (!sb) return;

  // Get logged-in user email
  let userEmail = '';
  try {
    const session = JSON.parse(localStorage.getItem('sivraj_auth_session') || '{}');
    userEmail = session.email || '';
  } catch {}

  let html = `
    <div class="sidebar-brand">
      <span class="sidebar-brand-dot"></span>
      <span class="sidebar-brand-name">SIVRAJ</span>
      <span class="sidebar-brand-ver">v4.0</span>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-section-title">OPERATIONS</div>`;
  let lastSection = 'OPERATIONS';
  for (const p of PAGES) {
    if (p.section && p.section !== lastSection) {
      html += `</div><div class="sidebar-section"><div class="sidebar-section-title">${p.section}</div>`;
      lastSection = p.section;
    }
    const active = p.id === current ? ' active' : '';
    const badge = p.badge ? '<span class="sidebar-link-badge" id="findingsBadge">0</span>' : '';
    html += `<a class="sidebar-link${active}" href="${p.href}">
      <span class="sidebar-link-icon">${p.icon}</span>
      <span class="sidebar-link-label">${p.label}</span>${badge}
    </a>`;
  }
  html += `</div>
    <div class="sidebar-status">
      <div class="sidebar-status-row"><span>AGENT</span><span class="sidebar-status-val" id="sidebarAgentStatus" style="color:var(--text3)">—</span></div>
      <div class="sidebar-status-row"><span>UPTIME</span><span class="sidebar-status-val" id="sidebarUptime">—</span></div>
      <div class="sidebar-status-row"><span>USER</span><span class="sidebar-status-val" style="color:var(--cyan);font-size:.55rem">${userEmail || '—'}</span></div>
      <div class="sidebar-status-row" style="margin-top:4px"><span></span><a href="#" onclick="logout();return false" style="color:var(--red);font-family:var(--mono);font-size:.6rem;text-decoration:none">🔒 Logout</a></div>
    </div>`;
  sb.innerHTML = html;
}

function renderTopbar(title, icon, actions = '') {
  const tb = document.getElementById('appTopbar');
  if (!tb) return;
  tb.innerHTML = `
    <div class="topbar-title"><span class="topbar-title-icon">${icon}</span> ${title}</div>
    <div class="topbar-actions">
      ${actions}
      <span class="topbar-time" id="topbarTime"></span>
    </div>`;
  updateClock();
  setInterval(updateClock, 1000);
}

function updateClock() {
  const el = document.getElementById('topbarTime');
  if (el) el.textContent = new Date().toLocaleTimeString('en-IN', { hour12: false });
}

// Sidebar agent status (polls real API if available)
async function updateSidebarStatus() {
  const statusEl = document.getElementById('sidebarAgentStatus');
  const uptimeEl = document.getElementById('sidebarUptime');
  if (!statusEl) return;

  // Try the API if api.js is loaded
  if (typeof api !== 'undefined' && typeof api.getStatus === 'function') {
    const status = await api.getStatus();
    if (status && status.online) {
      statusEl.textContent = '● ONLINE';
      statusEl.style.color = 'var(--green)';
      if (uptimeEl && typeof formatUptime === 'function') {
        uptimeEl.textContent = formatUptime(status.uptime);
      }
    } else {
      statusEl.textContent = '● OFFLINE';
      statusEl.style.color = 'var(--red)';
      if (uptimeEl) uptimeEl.textContent = '—';
    }
  } else {
    statusEl.textContent = '—';
    statusEl.style.color = 'var(--text3)';
  }
}

// LocalStorage helpers
function lsGet(key, fallback) { try { return JSON.parse(localStorage.getItem('sivraj_' + key)) || fallback; } catch { return fallback; } }
function lsSet(key, val) { localStorage.setItem('sivraj_' + key, JSON.stringify(val)); }

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  // Check agent status after a brief delay (let api.js load first)
  setTimeout(updateSidebarStatus, 1000);
  // Re-check every 15 seconds
  setInterval(updateSidebarStatus, 15000);
});

