// Auth module - Login, session, middleware

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 menit
const WARNING_BEFORE = 30 * 1000; // 30 detik sebelum habis

// Generate session token
function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Verify credentials
export function verifyLogin(username, password, users) {
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return null;
  return { username: user.username, role: user.role, email: user.email || '' };
}

// Create session
export function createSession(user) {
  const token = generateToken();
  const session = {
    token,
    username: user.username,
    role: user.role,
    email: user.email,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };
  return session;
}

// Validate session
export function validateSession(session) {
  if (!session) return null;
  const now = Date.now();
  if (now - session.lastActivity > SESSION_TIMEOUT) {
    return null; // Session expired
  }
  return session;
}

// Refresh session activity
export function refreshSession(session) {
  if (!session) return null;
  session.lastActivity = Date.now();
  return session;
}

// Get session from cookie
export function getSessionFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(atob(match[1]));
  } catch {
    return null;
  }
}

// Set session cookie
export function setSessionCookie(session) {
  const encoded = btoa(JSON.stringify(session));
  return `session=${encoded}; Path=/; Max-Age=${SESSION_TIMEOUT / 1000}; SameSite=Strict`;
}

// Clear session cookie
export function clearSessionCookie() {
  return `session=; Path=/; Max-Age=0; SameSite=Strict`;
}

export { SESSION_TIMEOUT, WARNING_BEFORE };
