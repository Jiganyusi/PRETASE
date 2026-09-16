// PRETASE Worker 1 - Auth & Upload
// Secrets: SESSION_SECRET, GITHUB_TOKEN (via wrangler secret)

const SESSION_TIMEOUT = parseInt(env.SESSION_TIMEOUT || '86400000');

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return token;
}

function getSession(request) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    const s = JSON.parse(atob(match[1]));
    if (Date.now() - s.lastActivity > SESSION_TIMEOUT) return null;
    return s;
  } catch { return null; }
}

function setSessionCookie(session) {
  return `session=${btoa(JSON.stringify(session))}; Path=/; Max-Age=${SESSION_TIMEOUT / 1000}; HttpOnly; SameSite=Strict; Secure`;
}

function clearSessionCookie() {
  return 'session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict; Secure';
}

async function handleLogin(request) {
  try {
    const { username, password } = await request.json();
    // TODO: Load users from KV or external source
    // For now, single user from env
    const validUser = username === 'DevPretase' && password === 'test1234';
    if (!validUser) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const session = {
      username,
      role: 'owner',
      lastActivity: Date.now(),
      token: generateToken(),
    };
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': setSessionCookie(session),
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Bad request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function handleLogout() {
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(),
    },
  });
}

async function handleUpload(request, env) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return new Response(JSON.stringify({ success: false, error: 'No file' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);

    const fileName = file.name;
    const repo = 'Jiganyusi/PRETASE';
    const path = `uploads/${fileName}`;
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

    // Check if file exists
    const checkRes = await fetch(apiUrl, {
      headers: { Authorization: `token ${env.GITHUB_TOKEN}` },
    });
    let sha = null;
    if (checkRes.ok) {
      const data = await checkRes.json();
      sha = data.sha;
    }

    // Upload
    const uploadRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload ${fileName}`,
        content: base64,
        sha,
      }),
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return new Response(JSON.stringify({ success: false, error: err }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, path }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

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

function uploadPage() {
  return new Response(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>PRETASE Upload</title>
<style>
body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;margin:0}
.h{background:linear-gradient(135deg,#1e293b,#0f172a);border-bottom:1px solid #334155;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}
h1{color:#f8fafc;font-size:1.2rem;margin:0}
.c{padding:2rem;max-width:500px;margin:0 auto}
.a{background:#1e293b;border:2px dashed #334155;border-radius:1rem;padding:2rem;text-align:center;cursor:pointer}
.a:hover{border-color:#3b82f6}
.a h3{color:#fbbf24}
.a p{color:#94a3b8}
.a input{display:none}
.bar{background:#0f172a;border-radius:0.5rem;height:6px;overflow:hidden;margin-top:1rem;display:none}
.bar div{height:100%;background:#3b82f6;width:0%}
.sta{margin-top:1rem;padding:0.75rem;border-radius:0.5rem;display:none}
.sta.ok{background:#065f46;color:#34d399;display:block}
.sta.er{background:#7f1d1d;color:#f87171;display:block}
button{border:none;padding:0.5rem 1rem;border-radius:0.5rem;cursor:pointer;font-size:0.85rem}
.b-b{background:#334155;color:#e2e8f0}
</style></head>
<body>
<div class="h"><h1>Upload</h1><button class="b-b" onclick="location.href='/'">Kembali</button></div>
<div class="c">
<div class="a" onclick="document.getElementById('f').click()"><h3>Pilih File</h3><p>.xlsx / .xls (max 10MB)</p><input type="file" id="f" accept=".xlsx,.xls" onchange="upload(this.files[0])"></div>
<div class="bar" id="bar"><div id="fill"></div></div>
<div class="sta" id="sta"></div>
</div>
<script>
function upload(file){
if(!file)return;
if(!file.name.match(/\.(xlsx|xls)$/i)){show('er','Format tidak didukung');return}
if(file.size>10*1024*1024){show('er','Terlalu besar');return}
const fd=new FormData();fd.append('file',file);
const x=new XMLHttpRequest();
document.getElementById('bar').style.display='block';
x.upload.onprogress=e=>{if(e.lengthComputable)document.getElementById('fill').style.width=Math.round(e.loaded/e.total*100)+'%'};
x.onload=()=>{document.getElementById('bar').style.display='none';try{const d=JSON.parse(x.responseText);show(d.success?'ok':'er',d.success?'Berhasil!':'Gagal: '+(d.error||''))}catch{show('er','Gagal')}};
x.onerror=()=>{document.getElementById('bar').style.display='none';show('er','Network error')};
x.open('POST','/api/upload');x.send(fd);
}
function show(t,m){const e=document.getElementById('sta');e.className='sta '+t;e.textContent=m}
</script>
</body></html>`, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Public routes
    if (path === '/api/login' && request.method === 'POST') {
      return handleLogin(request);
    }

    if (path === '/api/logout') {
      return handleLogout();
    }

    if (path === '/api/upload' && request.method === 'POST') {
      return handleUpload(request, env);
    }

    // Protected routes
    const session = getSession(request);
    if (!session) {
      if (path === '/api/test') {
        return new Response(JSON.stringify({ ok: true, time: Date.now() }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(null, { status: 302, headers: { Location: '/login' } });
    }

    if (path === '/') {
      return new Response(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>PRETASE Dashboard</title>
<style>
body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;margin:0}
.h{background:linear-gradient(135deg,#1e293b,#0f172a);border-bottom:1px solid #334155;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}
h1{color:#f8fafc;font-size:1.4rem;margin:0}
.c{padding:2rem;max-width:1200px;margin:0 auto}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:1rem;margin-bottom:2rem}
.cd{background:#1e293b;border:1px solid #334155;border-radius:0.75rem;padding:1rem;cursor:pointer}
.cd:hover{border-color:#3b82f6}
.cd h3{color:#fbbf24;margin-bottom:0.25rem;font-size:0.95rem}
.cd p{color:#94a3b8;font-size:0.8rem;margin:0}
.s{color:#fbbf24;margin:1.5rem 0 0.75rem;border-bottom:1px solid #334155;padding-bottom:0.5rem}
button{border:none;padding:0.5rem 1rem;border-radius:0.5rem;cursor:pointer;font-size:0.85rem}
.b-r{background:#dc2626;color:#fff}
</style></head>
<body>
<div class="h"><h1>PRETASE</h1><div><span style="color:#94a3b8;margin-right:1rem">${session.username} (${session.role})</span><button class="b-r" onclick="fetch('/api/logout').then(()=>location.href='/login')">Logout</button></div></div>
<div class="c">
<div class="s">Menu</div><div class="g">
<div class="cd" onclick="location.href='/upload'"><h3>Upload</h3><p>Upload file Excel</p></div>
</div></div>
</body></html>`, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (path === '/upload') {
      return uploadPage();
    }

    if (path === '/login') {
      return loginPage();
    }

    return new Response('Not Found', { status: 404 });
  },
};
