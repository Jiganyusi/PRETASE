// Pembayran Region - Cloudflare Worker v2 (PRETASE)
// With Auth system

import { verifyLogin, createSession, getSessionFromCookie, setSessionCookie, clearSessionCookie, validateSession, SESSION_TIMEOUT } from './auth.js';

// User data (sementara)
const USERS = [
  { username: 'DevPretase', password: 'test1234', role: 'owner', email: '', chat_id: '' }
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Login page
    if (path === '/login') {
      return new Response(LOGIN_HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }
    
    // Login API
    if (path === '/api/login' && request.method === 'POST') {
      try {
        const { username, password } = await request.json();
        const user = verifyLogin(username, password, USERS);
        if (!user) {
          return new Response(JSON.stringify({ success: false, error: 'Username atau password salah' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const session = createSession(user);
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Set-Cookie': setSessionCookie(session),
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Logout API
    if (path === '/api/logout') {
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': clearSessionCookie(),
        },
      });
    }
    
    // Check session
    const session = getSessionFromCookie(request.headers.get('Cookie'));
    const validSession = validateSession(session);
    
    // Protected routes - redirect to login if no session
    if (!validSession) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/login' },
      });
    }
    
    // Dashboard
    if (path === '/') {
      return new Response(DASHBOARD_HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }
    
    // Sheet viewer
    if (path.startsWith('/sheet/')) {
      const sheetFile = path.replace('/sheet/', '');
      return new Response(SHEET_VIEWER_HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }
    
    // Cek rekening
    if (path === '/cek-rekening') {
      return new Response(CEK_REKENING_HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }
    
    // Upload
    if (path === '/upload') {
      return new Response(UPLOAD_HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }
    
    // 404
    return new Response('Not Found', { status: 404 });
  },
};

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - PRETASE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .login-box { background: #1e293b; border: 1px solid #334155; border-radius: 1rem; padding: 2.5rem; width: 100%; max-width: 400px; }
    .login-box h1 { color: #fbbf24; text-align: center; margin-bottom: 0.5rem; }
    .login-box p { color: #94a3b8; text-align: center; margin-bottom: 2rem; font-size: 0.9rem; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; color: #94a3b8; margin-bottom: 0.5rem; font-size: 0.85rem; }
    .form-group input { width: 100%; padding: 0.75rem; background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; color: #e2e8f0; font-size: 1rem; }
    .form-group input:focus { outline: none; border-color: #3b82f6; }
    .btn-login { width: 100%; padding: 0.75rem; background: #3b82f6; color: #fff; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; }
    .btn-login:hover { background: #2563eb; }
    .forgot-link { display: block; text-align: center; margin-top: 1rem; color: #60a5fa; font-size: 0.85rem; text-decoration: none; }
    .error { background: #7f1d1d; color: #f87171; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: center; font-size: 0.85rem; display: none; }
  </style>
</head>
<body>
  <div class="login-box">
    <h1>🔐 PRETASE</h1>
    <p>Silakan login untuk melanjutkan</p>
    <div class="error" id="errorMsg"></div>
    <form id="loginForm">
      <div class="form-group">
        <label>Username</label>
        <input type="text" id="username" required autocomplete="username">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="password" required autocomplete="current-password">
      </div>
      <button type="submit" class="btn-login">Login</button>
    </form>
    <a href="#" class="forgot-link" onclick="alert('Fitur lupa password akan segera hadir')">Lupa password?</a>
  </div>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await resp.json();
      if (data.success) {
        window.location.href = '/';
      } else {
        const err = document.getElementById('errorMsg');
        err.textContent = data.error || 'Login gagal';
        err.style.display = 'block';
      }
    });
  </script>
</body>
</html>`;

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - PRETASE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #334155; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .header h1 { font-size: 1.5rem; color: #f8fafc; }
    .header-actions { display: flex; gap: 0.5rem; align-items: center; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
    .btn-logout { background: #dc2626; color: #fff; }
    .btn-logout:hover { background: #b91c1c; }
    .container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .welcome { margin-bottom: 2rem; }
    .welcome h2 { color: #fbbf24; margin-bottom: 0.5rem; }
    .welcome p { color: #94a3b8; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .sheet-card { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.5rem; cursor: pointer; transition: all 0.2s; }
    .sheet-card:hover { border-color: #3b82f6; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
    .sheet-card h3 { color: #fbbf24; margin-bottom: 0.5rem; }
    .sheet-card p { color: #94a3b8; font-size: 0.85rem; }
    .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
    .menu-card { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.5rem; cursor: pointer; text-align: center; transition: all 0.2s; }
    .menu-card:hover { border-color: #3b82f6; }
    .menu-card .icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .menu-card h4 { color: #fbbf24; }
    .section-title { color: #fbbf24; margin: 2rem 0 1rem; font-size: 1.1rem; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
    .session-timer { position: fixed; bottom: 1rem; right: 1rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 0.85rem; }
    .session-timer.warning { border-color: #f59e0b; color: #fbbf24; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 PRETASE</h1>
    <div class="header-actions">
      <span style="color:#94a3b8" id="userInfo">DevPretase (Owner)</span>
      <button class="btn btn-logout" onclick="logout()">Logout</button>
    </div>
  </div>
  <div class="container">
    <div class="welcome">
      <h2>Selamat datang, DevPretase!</h2>
      <p>Role: Owner</p>
    </div>
    
    <h3 class="section-title">📁 Sheet Tersedia</h3>
    <div class="grid" id="sheetGrid"></div>
    
    <h3 class="section-title">⚡ Menu</h3>
    <div class="menu-grid" id="menuGrid"></div>
  </div>
  
  <div class="session-timer" id="sessionTimer">Session: 5:00</div>
  <script>
    const SHEETS = [
      { name: 'Email CDP', file: 'email-cdp.json' },
      { name: 'Rekrut', file: 'rekrut.json' },
      { name: 'BAPP', file: 'bapp.json' },
      { name: 'COLA', file: 'cola.json' },
      { name: 'CS', file: 'cs.json' },
      { name: 'Kontanan', file: 'kontanan.json' },
      { name: 'Perdin RO', file: 'perdin-ro.json' },
      { name: 'Lain-Lain', file: 'lain-lain.json' }
    ];
    
    const role = 'owner';
    
    // Owner & Admin: semua sheet. User: tertentu saja
    const availableSheets = (role === 'owner' || role === 'admin') ? SHEETS : SHEETS;
    
    // Render sheet cards
    const sheetGrid = document.getElementById('sheetGrid');
    availableSheets.forEach(function(s) {
      const card = document.createElement('div');
      card.className = 'sheet-card';
      card.innerHTML = '<h3>' + s.name + '</h3><p>Klik untuk lihat data</p>';
      card.onclick = function() { window.location.href = '/sheet/' + s.file; };
      sheetGrid.appendChild(card);
    });
    
    // Render menu
    const menuGrid = document.getElementById('menuGrid');
    const menus = [
      { icon: '🔍', name: 'Cek Rekening', url: '/cek-rekening' },
    ];
    
    // Upload only for Owner and Admin
    if (role === 'owner' || role === 'admin') {
      menus.unshift({ icon: '📤', name: 'Upload', url: '/upload' });
    }
    
    menus.forEach(function(m) {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.innerHTML = '<div class="icon">' + m.icon + '</div><h4>' + m.name + '</h4>';
      card.onclick = function() { window.location.href = m.url; };
      menuGrid.appendChild(card);
    });
    
    // Session timer
    let timeLeft = 5 * 60;
    
    function updateTimer() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const timer = document.getElementById('sessionTimer');
      timer.textContent = 'Session: ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
      
      if (timeLeft <= 30) timer.classList.add('warning');
      if (timeLeft <= 0) { alert('Session berakhir'); window.location.href = '/login'; return; }
      timeLeft--;
    }
    
    function refreshSession() {
      timeLeft = 5 * 60;
      document.getElementById('sessionTimer').classList.remove('warning');
    }
    
    document.addEventListener('click', refreshSession);
    document.addEventListener('scroll', refreshSession);
    document.addEventListener('keypress', refreshSession);
    
    setInterval(updateTimer, 1000);
    
    async function logout() {
      await fetch('/api/logout');
      window.location.href = '/login';
    }
  </script>
</body>
</html>`;

const SHEET_VIEWER_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sheet Viewer - PRETASE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #334155; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .header h1 { font-size: 1.5rem; color: #f8fafc; }
    .header-actions { display: flex; gap: 0.5rem; align-items: center; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
    .btn-back { background: #334155; color: #e2e8f0; }
    .btn-back:hover { background: #475569; }
    .btn-download { background: #059669; color: #fff; }
    .btn-download:hover { background: #047857; }
    .container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .controls { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; align-items: center; }
    .search-box { flex: 1; min-width: 200px; }
    .search-box input { width: 100%; padding: 0.5rem 1rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; color: #e2e8f0; font-size: 0.85rem; }
    .table-container { overflow-x: auto; border: 1px solid #334155; border-radius: 0.5rem; max-height: 70vh; overflow-y: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th { background: #1e293b; color: #94a3b8; padding: 0.75rem 0.5rem; text-align: left; border-bottom: 2px solid #334155; cursor: pointer; user-select: none; white-space: nowrap; position: sticky; top: 0; z-index: 10; }
    td { padding: 0.5rem; border-bottom: 1px solid #1e293b; white-space: nowrap; }
    tr:hover td { background: #1e293b; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600; }
    .badge-ift { background: #065f46; color: #34d399; }
    .badge-other { background: #1e3a8a; color: #60a5fa; }
    .currency-cell { text-align: right; font-variant-numeric: tabular-nums; color: #fbbf24; font-weight: 600; }
    .loading { text-align: center; padding: 3rem; color: #64748b; }
    .spinner { width: 40px; height: 40px; border: 3px solid #334155; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .session-timer { position: fixed; bottom: 1rem; right: 1rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 0.85rem; }
    .session-timer.warning { border-color: #f59e0b; color: #fbbf24; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Sheet Viewer</h1>
    <div class="header-actions">
      <button class="btn btn-back" onclick="window.location.href='/'">← Kembali</button>
      <button class="btn btn-download" onclick="downloadCSV()">⬇ Download CSV</button>
    </div>
  </div>
  <div class="container">
    <div class="controls">
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="🔍 Cari data...">
      </div>
      <div class="stats" id="stats">Total: 0</div>
    </div>
    <div id="content">
      <div class="loading"><div class="spinner"></div><br>Loading...</div>
    </div>
  </div>
  <div class="session-timer" id="sessionTimer">Session: 5:00</div>
  <script>
    let timeLeft = 5 * 60;
    
    function updateTimer() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const timer = document.getElementById('sessionTimer');
      timer.textContent = 'Session: ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
      if (timeLeft <= 30) timer.classList.add('warning');
      if (timeLeft <= 0) { alert('Session berakhir'); window.location.href = '/login'; return; }
      timeLeft--;
    }
    
    function refreshSession() {
      timeLeft = 5 * 60;
      document.getElementById('sessionTimer').classList.remove('warning');
    }
    
    document.addEventListener('click', refreshSession);
    document.addEventListener('scroll', refreshSession);
    
    setInterval(updateTimer, 1000);
    
    function downloadCSV() {
      alert('Fitur download CSV akan segera hadir');
    }
  </script>
</body>
</html>`;

const CEK_REKENING_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cek Rekening - PRETASE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #334155; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .header h1 { font-size: 1.5rem; color: #f8fafc; }
    .header-actions { display: flex; gap: 0.5rem; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
    .btn-back { background: #334155; color: #e2e8f0; }
    .btn-back:hover { background: #475569; }
    .container { padding: 2rem; max-width: 600px; margin: 0 auto; }
    .search-box { margin-bottom: 1.5rem; }
    .search-box input { width: 100%; padding: 0.75rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; color: #e2e8f0; font-size: 1rem; }
    .search-box input:focus { outline: none; border-color: #3b82f6; }
    .result-box { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.5rem; }
    .result-box h3 { color: #fbbf24; margin-bottom: 1rem; }
    .result-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #334155; }
    .result-row:last-child { border-bottom: none; }
    .result-label { color: #94a3b8; }
    .result-value { color: #e2e8f0; font-weight: 600; }
    .not-found { text-align: center; color: #f87171; padding: 2rem; }
    .session-timer { position: fixed; bottom: 1rem; right: 1rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 0.85rem; }
    .session-timer.warning { border-color: #f59e0b; color: #fbbf24; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Cek Rekening</h1>
    <div class="header-actions">
      <button class="btn btn-back" onclick="window.location.href='/'">← Kembali</button>
    </div>
  </div>
  <div class="container">
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="Masukkan No. Rekening atau Nama..." onkeyup="if(event.key==='Enter')search()">
    </div>
    <div class="result-box" id="resultBox">
      <p style="color:#94a3b8;text-align:center">Masukkan kata kunci untuk mencari rekening</p>
    </div>
  </div>
  <div class="session-timer" id="sessionTimer">Session: 5:00</div>
  <script>
    let timeLeft = 5 * 60;
    let mRekening = {};
    
    function updateTimer() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const timer = document.getElementById('sessionTimer');
      timer.textContent = 'Session: ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
      if (timeLeft <= 30) timer.classList.add('warning');
      if (timeLeft <= 0) { alert('Session berakhir'); window.location.href = '/login'; return; }
      timeLeft--;
    }
    
    function refreshSession() {
      timeLeft = 5 * 60;
      document.getElementById('sessionTimer').classList.remove('warning');
    }
    
    document.addEventListener('click', refreshSession);
    document.addEventListener('scroll', refreshSession);
    
    setInterval(updateTimer, 1000);
    
    // Load m-rekening data
    fetch('/api/sheet/m-rekening.json')
      .then(r => r.json())
      .then(data => { mRekening = data; })
      .catch(() => {});
    
    function search() {
      const query = document.getElementById('searchInput').value.toLowerCase().trim();
      const resultBox = document.getElementById('resultBox');
      
      if (!query) {
        resultBox.innerHTML = '<p style="color:#94a3b8;text-align:center">Masukkan kata kunci untuk mencari rekening</p>';
        return;
      }
      
      const results = Object.entries(mRekening).filter(([code, rek]) => {
        return code.toLowerCase().includes(query) ||
               rek.nama.toLowerCase().includes(query) ||
               rek.no_rek.includes(query) ||
               rek.bank.toLowerCase().includes(query);
      });
      
      if (results.length === 0) {
        resultBox.innerHTML = '<div class="not-found">❌ Data tidak ditemukan</div>';
        return;
      }
      
      let html = '<h3>Hasil Pencarian (' + results.length + ' ditemukan)</h3>';
      results.forEach(([code, rek]) => {
        html += '<div class="result-row"><span class="result-label">Code</span><span class="result-value">' + code + '</span></div>';
        html += '<div class="result-row"><span class="result-label">Nama</span><span class="result-value">' + rek.nama + '</span></div>';
        html += '<div class="result-row"><span class="result-label">No. Rekening</span><span class="result-value">' + rek.no_rek + '</span></div>';
        html += '<div class="result-row"><span class="result-label">Bank</span><span class="result-value">' + rek.bank + '</span></div>';
        html += '<hr style="border-color:#334155;margin:1rem 0">';
      });
      resultBox.innerHTML = html;
    }
  </script>
</body>
</html>`;

const UPLOAD_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload - PRETASE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #334155; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .header h1 { font-size: 1.5rem; color: #f8fafc; }
    .header-actions { display: flex; gap: 0.5rem; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
    .btn-back { background: #334155; color: #e2e8f0; }
    .btn-back:hover { background: #475569; }
    .container { padding: 2rem; max-width: 600px; margin: 0 auto; }
    .upload-area { background: #1e293b; border: 2px dashed #334155; border-radius: 1rem; padding: 3rem; text-align: center; cursor: pointer; transition: all 0.2s; }
    .upload-area:hover { border-color: #3b82f6; }
    .upload-area .icon { font-size: 3rem; margin-bottom: 1rem; }
    .upload-area h3 { color: #fbbf24; margin-bottom: 0.5rem; }
    .upload-area p { color: #94a3b8; font-size: 0.9rem; }
    .upload-area input { display: none; }
    .progress { margin-top: 1.5rem; background: #0f172a; border-radius: 0.5rem; height: 8px; overflow: hidden; display: none; }
    .progress-bar { height: 100%; background: #3b82f6; width: 0%; transition: width 0.3s; }
    .status { margin-top: 1rem; padding: 0.75rem; border-radius: 0.5rem; display: none; }
    .status.success { display: block; background: #065f46; color: #34d399; }
    .status.error { display: block; background: #7f1d1d; color: #f87171; }
    .session-timer { position: fixed; bottom: 1rem; right: 1rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 0.85rem; }
    .session-timer.warning { border-color: #f59e0b; color: #fbbf24; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📤 Upload Excel</h1>
    <div class="header-actions">
      <button class="btn btn-back" onclick="window.location.href='/'">← Kembali</button>
    </div>
  </div>
  <div class="container">
    <div class="upload-area" id="uploadArea" onclick="document.getElementById('fileInput').click()">
      <div class="icon">📁</div>
      <h3>Klik atau drag file Excel di sini</h3>
      <p>Format: .xlsx, .xls (maks 10MB)</p>
      <input type="file" id="fileInput" accept=".xlsx,.xls" onchange="handleFile(this)">
    </div>
    <div class="progress" id="progress"><div class="progress-bar" id="progressBar"></div></div>
    <div class="status" id="status"></div>
    <p style="color:#64748b;font-size:0.85rem;margin-top:1.5rem">
      <strong>Catatan:</strong> Setelah upload, JSON cache akan di-regenerate oleh GitHub Actions (1-2 menit). 
      Data baru akan muncul setelah proses selesai.
    </p>
  </div>
  <div class="session-timer" id="sessionTimer">Session: 5:00</div>
  <script>
    let timeLeft = 5 * 60;
    
    function updateTimer() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const timer = document.getElementById('sessionTimer');
      timer.textContent = 'Session: ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
      if (timeLeft <= 30) timer.classList.add('warning');
      if (timeLeft <= 0) { alert('Session berakhir'); window.location.href = '/login'; return; }
      timeLeft--;
    }
    
    function refreshSession() {
      timeLeft = 5 * 60;
      document.getElementById('sessionTimer').classList.remove('warning');
    }
    
    document.addEventListener('click', refreshSession);
    document.addEventListener('scroll', refreshSession);
    
    setInterval(updateTimer, 1000);
    
    function handleFile(input) {
      const file = input.files[0];
      if (!file) return;
      
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        showStatus('error', 'Format file tidak didukung. Gunakan .xlsx atau .xls');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        showStatus('error', 'Ukuran file terlalu besar (maks 10MB)');
        return;
      }
      
      uploadFile(file);
    }
    
    function uploadFile(file) {
      const progress = document.getElementById('progress');
      const progressBar = document.getElementById('progressBar');
      const status = document.getElementById('status');
      
      progress.style.display = 'block';
      progressBar.style.width = '0%';
      status.style.display = 'none';
      
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', function(e) {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          progressBar.style.width = pct + '%';
        }
      });
      
      xhr.addEventListener('load', function() {
        progress.style.display = 'none';
        
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            showStatus('success', '✅ Upload berhasil! JSON akan di-regenerate oleh GitHub Actions (1-2 menit)');
          } else {
            showStatus('error', '❌ Upload gagal: ' + (data.error || 'Unknown error'));
          }
        } catch (e) {
          showStatus('error', '❌ Upload gagal: ' + e.message);
        }
      });
      
      xhr.addEventListener('error', function() {
        progress.style.display = 'none';
        showStatus('error', '❌ Upload gagal: Network error');
      });
      
      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    }
    
    function showStatus(type, message) {
      const status = document.getElementById('status');
      status.className = 'status ' + type;
      status.textContent = message;
    }
  </script>
</body>
</html>`;
