// ═══════════════════════════════════════════════════════════════
// SIVRAJ CIC — Shared App Shell
// ═══════════════════════════════════════════════════════════════

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
      <div class="sidebar-status-row"><span>STATUS</span><span class="sidebar-status-val" style="color:var(--green)">● ONLINE</span></div>
      <div class="sidebar-status-row"><span>UPTIME</span><span class="sidebar-status-val" id="sidebarUptime">—</span></div>
      <div class="sidebar-status-row"><span>MEMORY</span><span class="sidebar-status-val" id="sidebarMem">—</span></div>
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

// Uptime counter
const BOOT_TIME = Date.now();
function updateUptime() {
  const el = document.getElementById('sidebarUptime');
  if (!el) return;
  const diff = Date.now() - BOOT_TIME;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  el.textContent = `${h}h ${m}m`;
}
setInterval(updateUptime, 60000);

// LocalStorage helpers
function lsGet(key, fallback) { try { return JSON.parse(localStorage.getItem('sivraj_' + key)) || fallback; } catch { return fallback; } }
function lsSet(key, val) { localStorage.setItem('sivraj_' + key, JSON.stringify(val)); }

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  updateUptime();
});
