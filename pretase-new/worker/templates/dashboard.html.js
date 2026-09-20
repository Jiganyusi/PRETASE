// Dashboard page template
export const DASHBOARD_HTML = `<!DOCTYPE html>
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
