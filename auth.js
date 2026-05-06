// ═══════════════════════════════════════════════════════════════
// SIVRAJ CIC — Authentication Gate
// Every page checks this before rendering ANY content.
// If not authenticated → redirect to /login
// ═══════════════════════════════════════════════════════════════

const AUTH_CONFIG = {
  // SHA-256 hash of the password (so plaintext isn't in source code)
  // Default password: "sivraj2026" — change by updating the hash
  // To generate a new hash: crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-password'))
  passwordHash: '56956ea9b7d0d7011b36ef165aaf1b36c98972af6dcf68eab2ed534a2b6409f2',

  // Allowed email(s)
  allowedEmails: ['shivam@sivraj.in', 'shivamm.cyber@gmail.com'],

  // Session duration: 7 days (in milliseconds)
  sessionDuration: 7 * 24 * 60 * 60 * 1000,

  // Session key in localStorage
  sessionKey: 'sivraj_auth_session',
};

// ─── Hash Helper ─────────────────────────────────────────────
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Session Management ──────────────────────────────────────
function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_CONFIG.sessionKey);
    if (!raw) return null;
    const session = JSON.parse(raw);

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(AUTH_CONFIG.sessionKey);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function createSession(email) {
  const session = {
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + AUTH_CONFIG.sessionDuration,
    token: crypto.randomUUID(),
  };
  localStorage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(session));
  return session;
}

function destroySession() {
  localStorage.removeItem(AUTH_CONFIG.sessionKey);
}

// ─── Authentication Check ────────────────────────────────────
function isAuthenticated() {
  const session = getSession();
  return session !== null;
}

// ─── Login ───────────────────────────────────────────────────
async function attemptLogin(email, password) {
  // Validate email
  const emailLower = email.toLowerCase().trim();
  if (!AUTH_CONFIG.allowedEmails.includes(emailLower)) {
    return { success: false, error: 'Access denied — email not authorized' };
  }

  // Validate password
  const hash = await hashPassword(password);
  if (hash !== AUTH_CONFIG.passwordHash) {
    return { success: false, error: 'Invalid password' };
  }

  // Create session
  const session = createSession(emailLower);
  return { success: true, session };
}

// ─── Page Guard ──────────────────────────────────────────────
// Call this on every page EXCEPT login.html
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login';
    // Hide everything while redirecting
    document.documentElement.style.display = 'none';
    return false;
  }
  return true;
}

// ─── Logout ──────────────────────────────────────────────────
function logout() {
  destroySession();
  window.location.href = '/login';
}
