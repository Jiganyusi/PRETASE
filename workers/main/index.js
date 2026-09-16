// PRETASE Main Router
// Entry point yang proxy ke worker lain
// Semua cookie session di domain ini

const AUTH_URL = 'https://pretase-auth.rizkyer32013.workers.dev';
const DATA_URL = 'https://pretase-data.rizkyer32013.workers.dev';

function getSession(request) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    const s = JSON.parse(atob(match[1]));
    if (Date.now() - s.lastActivity > 86400000) return null;
    return s;
  } catch { return null; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Proxy ke Auth worker
    if (path.startsWith('/api/login') || path.startsWith('/api/logout') || path.startsWith('/api/upload')) {
      const authRequest = new Request(AUTH_URL + path + url.search, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      const authResponse = await fetch(authRequest);
      return new Response(authResponse.body, {
        status: authResponse.status,
        headers: authResponse.headers,
      });
    }

    // Proxy ke Data worker
    if (path.startsWith('/api/sheet/')) {
      const dataRequest = new Request(DATA_URL + path + url.search, {
        method: request.method,
        headers: request.headers,
      });
      const dataResponse = await fetch(dataRequest);
      return new Response(dataResponse.body, {
        status: dataResponse.status,
        headers: dataResponse.headers,
      });
    }

    // Protected routes
    const session = getSession(request);
    if (!session) {
      return new Response(null, { status: 302, headers: { Location: '/login' } });
    }

    // Dashboard
    if (path === '/') {
      return new Response(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>PRETASE</title>
<style>
body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;margin:0}
.h{background:linear-gradient(135deg,#1e293b,#0f172a);border-bottom:1px solid #334155;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}
h1{color:#f8fafc;font-size:1.4rem;margin:0}
.c{padding:2rem}
.info{background:#1e293b;border:1px solid #334155;border-radius:0.5rem;padding:1rem;max-width:400px}
button{border:none;padding:0.5rem 1rem;border-radius:0.5rem;cursor:pointer;font-size:0.85rem}
.b-r{background:#dc2626;color:#fff}
</style></head>
<body>
<div class="h"><h1>PRETASE</h1><div><span style="color:#94a3b8;margin-right:1rem">${session.username} (${session.role})</span><button class="b-r" onclick="location.href='/api/logout'">Logout</button></div></div>
<div class="c"><div class="info">
<h2>Dashboard</h2>
<p>Selamat datang, ${session.username}!</p>
<p>Role: ${session.role}</p>
<p>Worker Router aktif.</p>
</div></div>
</body></html>`, { headers: { 'Content-Type': 'text/html' } });
    }

    return new Response('Not Found', { status: 404 });
  },
};