// Pembayran Region - Cloudflare Worker
// Serves frontend + JSON data from GitHub

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
    
    // Upload endpoint - save Excel to GitHub
    if (path === '/api/upload' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) {
          return new Response(JSON.stringify({ error: 'No file' }), { status: 400, headers: corsHeaders });
        }
        
        const fileName = file.name || '2026 - Rekap Input CAMS.xlsx';
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64Content = btoa(binary);
        
        const repoUrl = 'https://api.github.com/repos/Jiganyusi/PRETASE/contents/' + encodeURIComponent(fileName);
        
        // Get SHA
        const getResp = await fetch(repoUrl, {
          headers: { 'Authorization': 'token ' + env.GITHUB_TOKEN },
        });
        let sha = null;
        if (getResp.ok) {
          const data = await getResp.json();
          sha = data.sha;
        }
        
        // Upload
        const uploadResp = await fetch(repoUrl, {
          method: 'PUT',
          headers: {
            'Authorization': 'token ' + env.GITHUB_TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Update ' + fileName + ' via web',
            content: base64Content,
            sha: sha,
          }),
        });
        
        if (!uploadResp.ok) {
          const err = await uploadResp.text();
          return new Response(JSON.stringify({ error: err }), { status: 500, headers: corsHeaders });
        }
        
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }
    
    // Default: serve HTML
    return new Response(HTML_PAGE, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};

const HTML_PAGE = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pembayaran Region</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
.header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #334155; padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.header h1 { font-size: 1.5rem; color: #f8fafc; font-weight: 700; }
.header p { font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem; }
.header-actions { display: flex; gap: 0.5rem; }
.btn-header { padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
.btn-upload { background: #7c3aed; color: #fff; }
.btn-download { background: #059669; color: #fff; }
.container { width: 100%; margin: 0; padding: 1rem; }
.sheet-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.tab { padding: 0.5rem 1rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; cursor: pointer; font-size: 0.85rem; color: #94a3b8; transition: all 0.2s; white-space: nowrap; }
.tab:hover { background: #334155; color: #e2e8f0; }
.tab.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.controls { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; align-items: center; }
.search-box { flex: 1; min-width: 200px; }
.search-box input { width: 100%; padding: 0.5rem 1rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; color: #e2e8f0; font-size: 0.85rem; }
.stats { font-size: 0.85rem; color: #94a3b8; }
.table-container { overflow-x: auto; border: 1px solid #334155; border-radius: 0.5rem; max-height: 70vh; overflow-y: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
th { background: #1e293b; color: #94a3b8; padding: 0.75rem 0.5rem; text-align: left; border-bottom: 2px solid #334155; cursor: pointer; user-select: none; white-space: nowrap; position: sticky; top: 0; z-index: 10; }
td { padding: 0.5rem; border-bottom: 1px solid #1e293b; white-space: nowrap; }
tr:hover td { background: #1e293b; }
.currency-cell { text-align: right; font-variant-numeric: tabular-nums; color: #fbbf24; font-weight: 600; }
.btn-view { background: #1e293b; color: #60a5fa; border: 1px solid #3b82f6; padding: 0.3rem 0.6rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; }
.btn-view:hover { background: #3b82f6; color: #fff; }
.pagination { display: flex; gap: 0.3rem; margin-top: 1rem; flex-wrap: wrap; justify-content: center; }
.pagination button { background: #1e293b; color: #94a3b8; border: 1px solid #334155; padding: 0.4rem 0.7rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.8rem; }
.pagination button.active { background: #3b82f6; color: #fff; }
.loading { text-align: center; padding: 3rem; color: #64748b; }
.spinner { width: 40px; height: 40px; border: 3px solid #334155; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>📊 Pembayaran Region</h1>
    <p>Data Rekap Pembayaran</p>
  </div>
  <div class="header-actions">
    <input type="file" id="uploadInput" accept=".xlsx,.xls" style="display:none" onchange="handleUpload(this)">
    <button class="btn-header btn-upload" onclick="document.getElementById('uploadInput').click()">📤 Upload</button>
    <button class="btn-header btn-download" onclick="downloadCSV()">⬇ Download</button>
  </div>
</div>
<div class="container">
  <div class="sheet-tabs" id="sheetTabs"></div>
  <div class="controls">
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="🔍 Cari data...">
    </div>
    <div class="stats">Total: <span id="totalRows">0</span></div>
  </div>
  <div id="content">
    <div class="loading"><div class="spinner"></div><br>Loading...</div>
  </div>
</div>
<script>
var SHEETS = [
  { name: 'Email CDP', file: 'email-cdp.json' },
  { name: 'Rekrut', file: 'rekrut.json' },
  { name: 'BAPP', file: 'bapp.json' },
  { name: 'COLA', file: 'cola.json' },
  { name: 'CS', file: 'cs.json' },
  { name: 'Kontanan', file: 'kontanan.json' },
  { name: 'Perdin RO', file: 'perdin-ro.json' },
  { name: 'Lain-Lain', file: 'lain-lain.json' }
];

var currentSheet = null;
var sheetData = { headers: [], rows: [] };
var sortCol = 0;
var sortAsc = false;
var currentPage = 1;
var rowsPerPage = 15;
var mRekening = {};

window.addEventListener("load", function() {
  loadSheetTabs();
  fetch("/api/sheet/m-rekening.json")
    .then(r => r.json())
    .then(data => { mRekening = data; })
    .catch(() => {})
    .then(() => loadSheet('email-cdp.json'));
});

function loadSheetTabs() {
  var tabs = document.getElementById("sheetTabs");
  tabs.innerHTML = "";
  SHEETS.forEach(function(s) {
    var btn = document.createElement("button");
    btn.className = "tab" + (currentSheet === s.file ? " active" : "");
    btn.textContent = s.name;
    btn.onclick = function() { loadSheet(s.file); };
    tabs.appendChild(btn);
  });
}

function loadSheet(file) {
  currentSheet = file;
  loadSheetTabs();
  document.getElementById("content").innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading...</div>';
  
  fetch('/api/sheet/' + file)
    .then(r => r.json())
    .then(data => {
      sheetData = { headers: data.headers, rows: data.rows };
      currentPage = 1;
      renderTable();
    })
    .catch(e => {
      document.getElementById("content").innerHTML = '<div class="loading">Error: ' + e.message + '</div>';
    });
}

function renderTable() {
  var rows = sheetData.rows.slice();
  
  if (sortCol >= 0) {
    rows.sort(function(a, b) {
      var va = a[sortCol] || "";
      var vb = b[sortCol] || "";
      if (sortCol === 0 || sortCol === 3) {
        var numA = parseFloat(String(va).replace(/[^0-9.-]/g, "")) || 0;
        var numB = parseFloat(String(vb).replace(/[^0-9.-]/g, "")) || 0;
        if (numA !== numB) return sortAsc ? numA - numB : numB - numA;
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
  }
  
  var totalPages = Math.ceil(rows.length / rowsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  var startIdx = (currentPage - 1) * rowsPerPage;
  var pageRows = rows.slice(startIdx, startIdx + rowsPerPage);
  
  var html = '<div class="table-container"><table><thead><tr>';
  sheetData.headers.forEach(function(h, idx) {
    html += '<th data-col="' + idx + '">' + h + (sortCol === idx ? (sortAsc ? " ▲" : " ▼") : "") + "</th>";
  });
  html += '<th>Aksi</th></tr></thead><tbody>';
  
  pageRows.forEach(function(row) {
    html += '<tr>';
    row.forEach(function(val, i) {
      var s = String(val || "");
      if (i === 3) {
        html += '<td><span class="currency-cell">Rp ' + Number(s).toLocaleString('id-ID') + "</span></td>";
      } else {
        html += "<td>" + s + "</td>";
      }
    });
    html += '<td><button class="btn-view" onclick="alert(' + row[0] + ')">👁</button></td></tr>';
  });
  
  html += '</tbody></table></div>';
  
  if (totalPages > 1) {
    html += '<div class="pagination">';
    html += '<button onclick="goToPage(1)">«</button>';
    for (var p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
        html += '<button onclick="goToPage(' + p + ')" class="' + (p === currentPage ? 'active' : '') + '">' + p + '</button>';
      }
    }
    html += '<button onclick="goToPage(' + totalPages + ')">»</button>';
    html += '</div>';
  }
  
  document.getElementById("content").innerHTML = html;
  document.getElementById("totalRows").textContent = sheetData.rows.length;
  
  document.querySelectorAll("th").forEach(function(th) {
    th.addEventListener("click", function() {
      var col = parseInt(this.dataset.col);
      if (sortCol === col) sortAsc = !sortAsc;
      else { sortCol = col; sortAsc = true; }
      currentPage = 1;
      renderTable();
    });
  });
}

function goToPage(page) {
  currentPage = page;
  renderTable();
}

function handleUpload(input) {
  var file = input.files[0];
  if (!file) return;
  
  var status = document.createElement("div");
  status.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1e293b;border:1px solid #3b82f6;border-radius:0.75rem;padding:2rem;z-index:2000;text-align:center;";
  status.innerHTML = '<div class="spinner" style="width:40px;height:40px;border:3px solid #334155;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 1rem;"></div><p style="color:#e2e8f0">Uploading...</p>';
  document.body.appendChild(status);
  
  var formData = new FormData();
  formData.append("file", file);
  
  fetch("/api/upload", { method: "POST", body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        status.innerHTML = '<p style="color:#34d399">✅ Uploaded!</p><p style="color:#94a3b8;font-size:0.85rem">GitHub Actions will regenerate JSON</p>';
        setTimeout(function() { status.remove(); location.reload(); }, 3000);
      } else {
        status.innerHTML = '<p style="color:#f87171">❌ ' + (data.error || "Failed") + '</p>';
        setTimeout(function() { status.remove(); }, 3000);
      }
    })
    .catch(err => {
      status.innerHTML = '<p style="color:#f87171">❌ ' + err.message + '</p>';
      setTimeout(function() { status.remove(); }, 3000);
    });
  
  input.value = '';
}

function downloadCSV() {
  if (!sheetData.rows || sheetData.rows.length === 0) return;
  
  var csv = [];
  csv.push(sheetData.headers.join(","));
  
  sheetData.rows.forEach(function(row) {
    var cells = row.map(function(val) {
      var s = String(val || "");
      if (s.indexOf(",") >= 0 || s.indexOf('"') >= 0) {
        s = '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    });
    csv.push(cells.join(","));
  });
  
  var blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
  var link = document.createElement("a");
  link.download = "Pembayaran_Region_" + (currentSheet || "Sheet1") + "_" + new Date().toISOString().slice(0, 10) + ".csv";
  link.href = URL.createObjectURL(blob);
  link.click();
}

document.getElementById("searchInput").addEventListener("input", function() { currentPage = 1; renderTable(); });
</script>
</body>
</html>`;