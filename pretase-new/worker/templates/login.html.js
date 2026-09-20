// Login page template
export const LOGIN_HTML = `<!DOCTYPE html>
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
