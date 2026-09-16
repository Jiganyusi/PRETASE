// PRETASE Worker 3 - Viewer
// Halaman login, dashboard, dan viewer

function loginPage() {
  return new Response(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>PRETASE Login</title>
<style>
body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{background:#1e293b;border:1px solid #334155;border-radius:1rem;padding:2rem;width:350px}
h1{color:#fbbf24;text-align:center;margin-bottom:1rem}
.i{width:100%;padding:0.75rem;margin:0.5rem 0;background:#0f172a;border:1px solid #334155;border-radius:0.5rem;color:#e2e8f0;box-sizing:border-box}
.b{width:100%;padding:0.75rem;background:#3b82f6;color:#fff;border:none;border-radius:0.5rem;font-size:1rem;cursor:pointer;margin-top:0.5rem}
.e{background:#7f1d1d;color:#f87171;padding:0.5rem;border-radius:0.5rem;margin-bottom:1rem;display:none}
</style></head>
<body><div class="box"><h1>PRETASE</h1><div class="e" id="err"></div><form id="f">
<input class="i" type="text" id="u" placeholder="Username" required>
<input class="i" type="password" id="p" placeholder="Password" required>
<button class="b" type="submit">Login</button></form>
<script>document.getElementById('f').onsubmit=async function(e){e.preventDefault();const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:document.getElementById('u').value,password:document.getElementById('p').value})});const d=await r.json();if(d.success)location.href='/';else{document.getElementById('err').textContent=d.error;document.getElementById('err').style.display='block'}}</script></div></body></html>`, {
    headers: { 'Content-Type': 'text/html' },
  });
}

function getSession(request) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(atob(match[1]));
  } catch { return null; }
}

function dashboardPage(session) {
  return new Response(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>PRETASE Dashboard</title>
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
<div class="h"><h1>PRETASE</h1><div><span style="color:#94a3b8;margin-right:1rem">${session.username} (${session.role})</span><button class="b-r" onclick="location.href='${AUTH_WORKER_URL}/api/logout'">Logout</button></div></div>
<div class="c"><div class="info">
<h2>Dashboard</h2>
<p>Selamat datang, ${session.username}!</p>
<p>Role: ${session.role}</p>
<p>Worker Viewer aktif.</p>
</div></div>
</body></html>`, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/login') {
      return new Response(null, {
        status: 302,
        headers: { Location: AUTH_WORKER_URL + '/login' },
      });
    }

    const session = getSession(request);
    if (session && path === '/') {
      return dashboardPage(session);
    }

    if (!session && path !== '/login') {
      return new Response(null, {
        status: 302,
        headers: { Location: AUTH_WORKER_URL + '/login' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};