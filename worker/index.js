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
    
    // Serve JSON data for a sheet
    if (path.startsWith('/api/sheet/') && request.method === 'GET') {
      const sheetName = path.replace('/api/sheet/', '');
      const jsonUrl = 'https://raw.githubusercontent.com/Jiganyusi/PRETASE/main/worker/sheets/' + sheetName;
      try {
        const resp = await fetch(jsonUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!resp.ok) {
          return new Response(JSON.stringify({ error: 'Sheet not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const data = await resp.json();
        return new Response(JSON.stringify(data), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
.header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #334155; padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.header h1 { font-size: 1.5rem; color: #f8fafc; font-weight: 700; }
.header p { font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem; }
.container { width: 100%; margin: 0; padding: 1rem; }
.sheet-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.tab { padding: 0.5rem 1rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; cursor: pointer; font-size: 0.85rem; color: #94a3b8; transition: all 0.2s; white-space: nowrap; }
.tab:hover { background: #334155; color: #e2e8f0; }
.tab.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.controls { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; align-items: center; }
.filter-select { padding: 0.5rem 1rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; color: #e2e8f0; font-size: 0.85rem; }
.stats { font-size: 0.85rem; color: #94a3b8; }
.search-box { flex: 1; min-width: 200px; }
.search-box input { width: 100%; padding: 0.5rem 1rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; color: #e2e8f0; font-size: 0.85rem; }
.table-container { overflow-x: auto; border: 1px solid #334155; border-radius: 0.5rem; max-height: 70vh; overflow-y: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
th { background: #1e293b; color: #94a3b8; padding: 0.75rem 0.5rem; text-align: left; border-bottom: 2px solid #334155; cursor: pointer; user-select: none; white-space: nowrap; position: sticky; top: 0; z-index: 10; }
td { padding: 0.5rem; border-bottom: 1px solid #1e293b; white-space: nowrap; }
tr:hover td { background: #1e293b; }
tr:nth-child(even) td { background: #0f172a; }
.badge { padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600; }
.badge-ift { background: #065f46; color: #34d399; }
.badge-other { background: #1e3a8a; color: #60a5fa; }
.badge-mass { background: #78350f; color: #fbbf24; }
.currency-cell { text-align: right; font-variant-numeric: tabular-nums; color: #fbbf24; font-weight: 600; }
.date-cell { color: #34d399; font-weight: 500; }
.btn-view { background: #1e293b; color: #60a5fa; border: 1px solid #3b82f6; padding: 0.3rem 0.6rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; }
.btn-view:hover { background: #3b82f6; color: #fff; }
.pagination { display: flex; gap: 0.3rem; margin-top: 1rem; flex-wrap: wrap; justify-content: center; }
.pagination button { background: #1e293b; color: #94a3b8; border: 1px solid #334155; padding: 0.4rem 0.7rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.8rem; }
.pagination button:hover:not(:disabled) { background: #334155; color: #e2e8f0; }
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
.pagination button.active { background: #3b82f6; color: #fff; }
.pagination-info { text-align: center; font-size: 0.8rem; color: #64748b; margin-top: 0.5rem; }
.loading { text-align: center; padding: 3rem; color: #64748b; }
.spinner { width: 40px; height: 40px; border: 3px solid #334155; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; }
.modal-overlay.active { display: flex; }
.modal { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 2rem; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; }
.modal-close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }
.modal-close:hover { color: #e2e8f0; }
.slip { background: linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%); border: 1px solid #3b82f6; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1rem; }
.slip-header { text-align: center; margin-bottom: 1rem; border-bottom: 1px solid #334155; padding-bottom: 1rem; }
.slip-header h2 { color: #fbbf24; font-size: 1.2rem; margin-bottom: 0.3rem; }
.slip-header p { color: #94a3b8; font-size: 0.85rem; }
.slip-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #334155; }
.slip-row:last-child { border-bottom: none; }
.slip-label { color: #94a3b8; font-size: 0.85rem; }
.slip-value { color: #e2e8f0; font-weight: 600; font-size: 0.85rem; text-align: right; max-width: 60%; word-break: break-word; }
.slip-value.masked { font-family: monospace; letter-spacing: 2px; }
.slip-total { background: #0f172a; border: 1px solid #3b82f6; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem; }
.slip-total .slip-row { border-bottom: 1px solid #1e293b; }
.slip-total .slip-label { color: #fbbf24; font-weight: 600; }
.slip-total .slip-value { color: #fbbf24; font-size: 1rem; }
.slip-status { text-align: center; padding: 0.5rem; border-radius: 0.5rem; margin-top: 1rem; font-weight: 600; }
.slip-status.success { background: #065f46; color: #34d399; }
.slip-status.pending { background: #78350f; color: #fbbf24; }
.slip-footer { text-align: center; font-size: 0.75rem; color: #64748b; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #334155; }
.modal-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.modal-actions button { flex: 1; padding: 0.6rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
.btn-print { background: #3b82f6; color: #fff; }
.btn-print:hover { background: #2563eb; }
.btn-download { background: #059669; color: #fff; }
.btn-download:hover { background: #047857; }
.btn-share { background: #7c3aed; color: #fff; position: relative; }
.btn-share:hover { background: #6d28d9; }
.share-menu { display: none; position: absolute; bottom: 100%; left: 0; right: 0; background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.5rem; margin-bottom: 0.5rem; z-index: 1001; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
.share-menu.show { display: block; }
.share-menu button { display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.6rem; background: none; border: none; color: #e2e8f0; text-align: left; cursor: pointer; border-radius: 0.25rem; font-size: 0.85rem; }
.share-menu button:hover { background: #334155; }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>📊 Pembayaran Region</h1>
    <p>Data Rekap Pembayaran</p>
  </div>
</div>
<div class="container">
  <div class="sheet-tabs" id="sheetTabs"></div>
  <div class="controls">
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="🔍 Cari data...">
    </div>
    <select class="filter-select" id="filterStatus">
      <option value="">Semua Status</option>
      <option value="lunas">Lunas</option>
      <option value="belum">Belum Bayar</option>
    </select>
    <div class="stats">
      Total: <span id="totalRows">0</span> | 
      Filtered: <span id="filteredRows">0</span>
    </div>
  </div>
  <div id="content">
    <div class="loading"><div class="spinner"></div><br>Loading...</div>
  </div>
</div>
<div class="modal-overlay" id="modalOverlay">
  <div class="modal">
    <button class="modal-close" onclick="closeModal()">×</button>
    <div id="slipContent"></div>
    <div class="modal-actions">
      <button class="btn-download" onclick="downloadImage()">📷 Download JPG</button>
      <button class="btn-share" onclick="toggleShare()">📤 Share</button>
      <div class="share-menu" id="shareMenu">
        <button onclick="shareEmail()">📧 Email</button>
        <button onclick="shareWhatsApp()">💬 WhatsApp</button>
      </div>
    </div>
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
var sheetData = { headers: [], rows: [], m_rekening: {} };
var sortCol = 0;
var sortAsc = false;
var currentPage = 1;
var rowsPerPage = 15;

window.addEventListener("load", function() {
  fetch("/api/sheet/email-cdp.json")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      sheetData = { headers: data.headers, rows: data.rows, m_rekening: data.m_rekening || {} };
      currentPage = 1;
      renderTable();
    })
    .catch(function(e) {
      document.getElementById("content").innerHTML = '<div class="loading">Error: ' + e.message + '</div>';
    });
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
    .then(function(r) { return r.json(); })
    .then(function(data) {
      sheetData = { headers: data.headers, rows: data.rows, m_rekening: data.m_rekening || {} };
      currentPage = 1;
      renderTable();
    })
    .catch(function(e) {
      document.getElementById("content").innerHTML = '<div class="loading">Error: ' + e.message + '</div>';
    });
}

function renderTable() {
  var search = document.getElementById("searchInput").value.toLowerCase();
  var statusFilter = document.getElementById("filterStatus").value;
  var rows = sheetData.rows.slice();
  
  if (search) {
    rows = rows.filter(function(row) {
      return row.some(function(cell) { return String(cell).toLowerCase().indexOf(search) >= 0; });
    });
  }
  
  if (statusFilter === "lunas") {
    rows = rows.filter(function(row) { return row[8] && row[8] !== ""; });
  } else if (statusFilter === "belum") {
    rows = rows.filter(function(row) { return !row[8] || row[8] === ""; });
  }
  
  if (sortCol >= 0) {
    rows.sort(function(a, b) {
      var va = a[sortCol] || "";
      var vb = b[sortCol] || "";
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
  }
  
  var totalPages = Math.ceil(rows.length / rowsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  var startIdx = (currentPage - 1) * rowsPerPage;
  var endIdx = startIdx + rowsPerPage;
  var pageRows = rows.slice(startIdx, endIdx);
  
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
      } else if (i === 7) {
        var kode = s.toUpperCase();
        var badge = "badge-other";
        if (kode.indexOf("IFT") >= 0) badge = "badge-ift";
        else if (kode.indexOf("MASS") >= 0) badge = "badge-mass";
        html += '<td><span class="badge ' + badge + '">' + s + "</span></td>";
      } else if (i === 8) {
        html += '<td><span class="date-cell">' + s + "</span></td>";
      } else {
        html += "<td>" + s + "</td>";
      }
    });
    html += '<td><button class="btn-view" onclick="showSlip(this)">👁</button></td></tr>';
  });
  
  html += '</tbody></table></div>';
  
  if (totalPages > 1) {
    html += '<div class="pagination">';
    html += '<button onclick="goToPage(1)"' + (currentPage === 1 ? ' disabled' : '') + '>« First</button>';
    html += '<button onclick="goToPage(' + (currentPage - 1) + ')"' + (currentPage === 1 ? ' disabled' : '') + '>‹ Prev</button>';
    for (var p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
        html += '<button onclick="goToPage(' + p + ')" class="' + (p === currentPage ? 'active' : '') + '">' + p + '</button>';
      }
    }
    html += '<button onclick="goToPage(' + (currentPage + 1) + ')"' + (currentPage === totalPages ? ' disabled' : '') + '>Next ›</button>';
    html += '<button onclick="goToPage(' + totalPages + ')"' + (currentPage === totalPages ? ' disabled' : '') + '>Last »</button>';
    html += '</div>';
    html += '<div class="pagination-info">Halaman ' + currentPage + ' dari ' + totalPages + ' | Menampilkan ' + (startIdx + 1) + '-' + Math.min(endIdx, rows.length) + ' dari ' + rows.length + ' baris</div>';
  }
  
  document.getElementById("content").innerHTML = html;
  document.getElementById("totalRows").textContent = sheetData.rows.length;
  document.getElementById("filteredRows").textContent = rows.length;
  
  var ths = document.querySelectorAll("th");
  for (var i = 0; i < ths.length; i++) {
    ths[i].addEventListener("click", function() {
      var col = parseInt(this.dataset.col);
      if (col === -1) return;
      if (sortCol === col) sortAsc = !sortAsc;
      else { sortCol = col; sortAsc = true; }
      currentPage = 1;
      renderTable();
    });
  }
}

function goToPage(page) {
  currentPage = page;
  renderTable();
}

function showSlip(btn) {
  var tr = btn.closest('tr');
  var row = Array.from(tr.children).map(function(td) { return td.textContent.replace(/[^a-zA-Z0-9\\s\\-\\./]/g, '').trim(); });
  
  // JSON columns: 0=No urut, 1=Ket, 2=Kebun, 3=Nilai, 4=Nama Rek, 5=Bank, 6=No rek, 7=Jenis Trx, 8=Lunas
  
  var tanggal = row[8] || "-";
  var kode = row[7] || "-";
  var kebun = row[2] || "";
  var nilai = Number(row[3].replace(/[^0-9]/g, "")) || 0;
  var namaRek = row[4] || "-";
  var bank = row[5] || "-";
  var noRek = row[6] || "-";
  var remarks = row[1] || "-";
  
  // Get sender info from M Rekening
  var sender = sheetData.m_rekening[kebun] || { nama: kebun, no_rek: "-", bank: "-" };
  var senderNama = sender.nama || kebun;
  var senderNoRek = sender.no_rek || "-";
  var senderBank = sender.bank || "-";
  
  // Status
  var status = "PROSES";
  var statusClass = "pending";
  if (tanggal && tanggal !== "-" && tanggal !== "0") {
    if (/^\\d{2}-\\d{2}-\\d{4}$/.test(tanggal)) {
      status = "SUKSES";
      statusClass = "success";
    } else {
      status = tanggal;
    }
  }
  
  // Fee
  var fee = 0;
  var kodeUpper = kode.toUpperCase();
  if (kodeUpper.indexOf("IFT") === 0) fee = 0;
  else if (kodeUpper.indexOf("BIF") === 0) fee = 2500;
  else if (kodeUpper.indexOf("KLR") === 0) fee = 2900;
  
  var grandTotal = nilai + fee;
  
  // Mask no rek pengirim
  var maskedRek = senderNoRek.length >= 7 ? senderNoRek.substring(0, 4) + "****" + senderNoRek.slice(-3) : senderNoRek;
  
  var html = '<div class="slip">';
  html += '<div class="slip-header"><h2>🏦 BUKTI TRANSFER</h2><p>PRETASE</p></div>';
  html += '<div class="slip-row"><span class="slip-label">Tanggal</span><span class="slip-value">' + tanggal + '</span></div>';
  html += '<div class="slip-row"><span class="slip-label">Status</span><span class="slip-value">' + status + '</span></div>';
  html += '<div class="slip-row"><span class="slip-label">Kode Transfer</span><span class="slip-value">' + kode + '</span></div>';
  html += '<div class="slip-row"><span class="slip-label">Pengirim</span><span class="slip-value">' + senderNama + '</span></div>';
  html += '<div class="slip-row"><span class="slip-label">Bank Pengirim</span><span class="slip-value">' + senderBank + '</span></div>';
  html += '<div class="slip-row"><span class="slip-label">No. Rekening</span><span class="slip-value masked">' + maskedRek + '</span></div>';
  html += '<div class="slip-row"><span class="slip-label">Penerima</span><span class="slip-value">' + bank + '<br>' + namaRek + '<br>' + noRek + '</span></div>';
  html += '<div class="slip-total">';
  html += '<div class="slip-row"><span class="slip-label">Jumlah</span><span class="slip-value">Rp ' + nilai.toLocaleString('id-ID') + '</span></div>';
  html += '<div class="slip-row"><span class="slip-label">Fee Transfer</span><span class="slip-value">Rp ' + fee.toLocaleString('id-ID') + '</span></div>';
  html += '<div class="slip-row"><span class="slip-label">Grand Total</span><span class="slip-value">Rp ' + grandTotal.toLocaleString('id-ID') + '</span></div>';
  html += '</div>';
  html += '<div class="slip-row"><span class="slip-label">Remarks</span><span class="slip-value">' + remarks + '</span></div>';
  html += '<div class="slip-status ' + statusClass + '">' + status + '</div>';
  html += '<div class="slip-footer">Slip ini dibuat melalui website PRETASE, cek kebenarannya dengan rekening koran anda.</div>';
  html += '</div>';
  
  document.getElementById("slipContent").innerHTML = html;
  document.getElementById("modalOverlay").classList.add("active");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("active");
  document.getElementById("shareMenu").classList.remove("show");
}

function downloadImage() {
  var slip = document.querySelector("#slipContent .slip");
  if (!slip) return;
  
  html2canvas(slip, {
    backgroundColor: '#1e293b',
    scale: 2,
    useCORS: true
  }).then(function(canvas) {
    var link = document.createElement("a");
    link.download = "slip-transfer-" + new Date().toISOString().slice(0, 10) + ".jpg";
    link.href = canvas.toDataURL("image/jpeg", 0.9);
    link.click();
  });
}

function toggleShare() {
  var menu = document.getElementById("shareMenu");
  menu.classList.toggle("show");
  if (menu.classList.contains("show")) {
    var btn = document.querySelector(".btn-share");
    var rect = btn.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.bottom = (window.innerHeight - rect.top + 5) + "px";
    menu.style.left = rect.left + "px";
    menu.style.right = (window.innerWidth - rect.right) + "px";
  }
}

function shareEmail() {
  var slip = document.querySelector("#slipContent .slip");
  if (!slip) return;
  
  html2canvas(slip, { backgroundColor: '#1e293b', scale: 2 }).then(function(canvas) {
    var dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    var subject = "Slip Transfer - PRETASE";
    var body = "Slip transfer terlampir dalam gambar.\\n\\nSlip ini dibuat melalui website PRETASE, cek kebenarannya dengan rekening koran anda.";
    window.open("mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body));
  });
}

function shareWhatsApp() {
  var slip = document.querySelector("#slipContent .slip");
  if (!slip) return;
  
  html2canvas(slip, { backgroundColor: '#1e293b', scale: 2 }).then(function(canvas) {
    var dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    // Download image first, then share via WhatsApp Web
    var link = document.createElement("a");
    link.href = dataUrl;
    link.download = "slip-transfer.jpg";
    link.click();
    // Open WhatsApp Web
    window.open("https://web.whatsapp.com/send?text=Slip%20transfer%20-%20PRETASE");
  });
}

document.getElementById("modalOverlay").addEventListener("click", function(e) {
  if (e.target === this) closeModal();
});

document.addEventListener("click", function(e) {
  var menu = document.getElementById("shareMenu");
  var btn = document.querySelector(".btn-share");
  if (menu && menu.classList.contains("show") && !menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove("show");
  }
});

document.getElementById("searchInput").addEventListener("input", function() { currentPage = 1; renderTable(); });
document.getElementById("filterStatus").addEventListener("change", function() { currentPage = 1; renderTable(); });
</script>
</body>
</html>`;