// ═══════════════════════════════════════════════════════════════
// SIVRAJ CIC — Real API Layer
// Every single piece of data comes from HERE, not hardcoded.
// When SIVRAJ agent is offline, everything shows "—" or "OFFLINE"
// ═══════════════════════════════════════════════════════════════

// Auto-detect: local dev vs production (via Cloudflare Tunnel)
const API_BASE = (() => {
  const host = window.location.hostname;
  // If loaded from localhost, talk to local SIVRAJ
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  // Production: try stored API URL first, then default
  const saved = localStorage.getItem('sivraj_api_url');
  if (saved) return saved;
  // Default: assume Cloudflare Tunnel or same origin proxy
  return 'http://localhost:3000';
})();

// Connection state
let _online = false;
let _lastCheck = 0;

const api = {
  // ─── Core Status ─────────────────────────────────────────────
  async getStatus() {
    try {
      const r = await fetch(`${API_BASE}/api/cic/status`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      _online = true;
      _lastCheck = Date.now();
      return await r.json();
    } catch {
      _online = false;
      _lastCheck = Date.now();
      return null;
    }
  },

  // ─── Logs ────────────────────────────────────────────────────
  async getLogs(count = 100, level = 'all', src = 'all') {
    try {
      const params = new URLSearchParams({ count: String(count), level, src });
      const r = await fetch(`${API_BASE}/api/cic/logs?${params}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!r.ok) return { logs: [], total: 0 };
      return await r.json();
    } catch {
      return { logs: [], total: 0 };
    }
  },

  // ─── Targets ─────────────────────────────────────────────────
  async getTargets() {
    try {
      const r = await fetch(`${API_BASE}/api/cic/targets`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!r.ok) return { targets: [], total: 0 };
      return await r.json();
    } catch {
      return { targets: [], total: 0 };
    }
  },

  async addTarget(name, type = 'Domain') {
    try {
      const r = await fetch(`${API_BASE}/api/cic/targets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type }),
        signal: AbortSignal.timeout(5000),
      });
      return await r.json();
    } catch {
      return null;
    }
  },

  // ─── Command Execution ───────────────────────────────────────
  async runCommand(command, args = {}) {
    try {
      const r = await fetch(`${API_BASE}/api/cic/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, args }),
        signal: AbortSignal.timeout(60000),
      });
      return await r.json();
    } catch (e) {
      return { error: String(e), success: false };
    }
  },

  // ─── Dashboard Tasks ─────────────────────────────────────────
  async getTasks(status = '') {
    try {
      const url = status
        ? `${API_BASE}/api/tasks?status=${status}`
        : `${API_BASE}/api/tasks`;
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!r.ok) return [];
      const data = await r.json();
      return data.tasks || data || [];
    } catch {
      return [];
    }
  },

  // ─── Helpers ─────────────────────────────────────────────────
  isOnline() { return _online; },
  getApiBase() { return API_BASE; },
  setApiBase(url) { localStorage.setItem('sivraj_api_url', url); },
};

// ─── Formatters ──────────────────────────────────────────────

function formatUptime(seconds) {
  if (!seconds || seconds <= 0) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

// ─── Offline Banner ──────────────────────────────────────────

function showOfflineBanner() {
  if (document.getElementById('offlineBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'offlineBanner';
  banner.innerHTML = `
    <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:1rem 1.5rem;margin-bottom:1rem;display:flex;align-items:center;gap:12px;font-family:var(--mono);font-size:.78rem">
      <span style="font-size:1.2rem">🔴</span>
      <div>
        <div style="color:#ef4444;font-weight:600;margin-bottom:2px">SIVRAJ AGENT OFFLINE</div>
        <div style="color:var(--text3)">Start the agent: <code style="background:var(--surface2);padding:2px 6px;border-radius:4px">cd sivraj && npm run dev</code></div>
        <div style="color:var(--text3);margin-top:4px">API: ${API_BASE} · <button onclick="location.reload()" style="color:var(--cyan);text-decoration:underline;background:none;border:none;cursor:pointer;font-family:inherit;font-size:inherit">Retry</button></div>
      </div>
    </div>`;
  const page = document.querySelector('.page');
  if (page) page.prepend(banner);
}

function hideOfflineBanner() {
  const banner = document.getElementById('offlineBanner');
  if (banner) banner.remove();
}
