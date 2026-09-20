// PRETASE Worker v11 - Clean rewrite based on gabungan.xlsx structure
// Auth + Dashboard + Sheet Viewer + Slip Modal

var CDN_BASE = "https://cdn.jsdelivr.net/gh/Jiganyusi/PRETASE@main/worker/sheets";

var USERS = [
  { username: "DevPretase", password: "test1234", role: "owner" },
];

var SHEETS = [
  { name: "email CDP", file: "email-cdp.json" },
  { name: "rekrut", file: "rekrut.json" },
  { name: "BAPP", file: "bapp.json" },
  { name: "COLA", file: "cola.json" },
  { name: "CS", file: "cs.json" },
  { name: "Kontanan", file: "kontanan.json" },
  { name: "Perdin RO", file: "perdin-ro.json" },
  { name: "Lain-Lain", file: "lain-lain.json" },
];

function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseCookies(request) {
  var cookie = request.headers.get("Cookie") || "";
  var parts = cookie.split(";");
  var cookies = {};
  for (var i = 0; i < parts.length; i++) {
    var idx = parts[i].indexOf("=");
    if (idx > -1) {
      cookies[parts[i].substring(0, idx).trim()] = parts[i].substring(idx + 1).trim();
    }
  }
  return cookies;
}

function getSession(request) {
  var cookies = parseCookies(request);
  var session = cookies.session;
  if (!session) return null;
  try {
    var decoded = atob(session);
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

function loginPage() {
  return new Response(
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Login</title>' +
    '<style>body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh}' +
    '.login-box{background:#1e293b;padding:2rem;border-radius:8px;width:300px}' +
    'input{width:100%;padding:8px;margin:8px 0;border:1px solid #334155;border-radius:4px;background:#0f172a;color:#e2e8f0}' +
    'button{width:100%;padding:10px;background:#3b82f6;color:#fff;border:none;border-radius:4px;cursor:pointer}' +
    'button:hover{background:#2563eb}' +
    '.error{color:#ef4444;text-align:center;margin-top:8px}</style></head>' +
    '<body><div class="login-box"><h2>PRETASE Login</h2>' +
    '<form method="POST" action="/api/login">' +
    '<input type="text" name="username" placeholder="Username" required>' +
    '<input type="password" name="password" placeholder="Password" required>' +
    '<button type="submit">Login</button>' +
    '<div class="error" id="err"></div></form></div>' +
    '<script>var params=new URLSearchParams(window.location.search);if(params.get("error")){document.getElementById("err").textContent="Login gagal";}</script>' +
    '</body></html>',
    { headers: { "Content-Type": "text/html" } }
  );
}

function dashboardPage(session) {
  var cards = SHEETS.map(function(s) {
    return '<div class="card" onclick="location.href=\'/sheet/?f=' + encodeURIComponent(s.file) + '\'">' +
      '<h3>' + esc(s.name) + '</h3><p>Klik untuk lihat data</p></div>';
  }).join("");

  return new Response(
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>PRETASE</title>' +
    '<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;min-height:100vh}' +
    '.header{background:#1e293b;padding:1rem;display:flex;justify-content:space-between;align-items:center}' +
    '.header h1{font-size:1.5rem}.header .user{font-size:0.9rem;color:#94a3b8}' +
    '.container{padding:2rem}.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem;margin-top:1rem}' +
    '.card{background:#1e293b;padding:1.5rem;border-radius:8px;cursor:pointer;transition:transform 0.2s}' +
    '.card:hover{transform:translateY(-4px);background:#334155}.card h3{color:#3b82f6;margin-bottom:0.5rem}' +
    '.card p{color:#94a3b8;font-size:0.9rem}' +
    '.logout{color:#ef4444;text-decoration:none;margin-left:1rem}</style></head>' +
    '<body><div class="header"><h1>PRETASE</h1>' +
    '<div><span class="user">' + esc(session.username) + ' (' + esc(session.role) + ')</span>' +
    '<a href="/api/logout" class="logout">Logout</a></div></div>' +
    '<div class="container"><h2>Dashboard</h2><div class="cards">' + cards + '</div></div></body></html>',
    { headers: { "Content-Type": "text/html" } }
  );
}

function sheetPage(sheetFile) {
  return new Response(
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Sheet</title>' +
    '<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;min-height:100vh}' +
    '.header{background:#1e293b;padding:1rem;display:flex;justify-content:space-between;align-items:center}' +
    '.header h1{font-size:1.5rem}.back{color:#3b82f6;text-decoration:none}' +
    '.container{padding:1rem}.toolbar{margin:1rem 0;display:flex;gap:0.5rem;flex-wrap:wrap}' +
    '.toolbar input,.toolbar select{padding:8px;border:1px solid #334155;border-radius:4px;background:#1e293b;color:#e2e8f0}' +
    '.toolbar button{padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:4px;cursor:pointer}' +
    '.toolbar button:hover{background:#2563eb}' +
    '.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:0.85rem}' +
    'th,td{padding:8px;text-align:left;border-bottom:1px solid #334155}' +
    'th{background:#1e293b;position:sticky;top:0;cursor:pointer}th:hover{background:#334155}' +
    'tr:hover{background:#1e293b}.num{text-align:right}.center{text-align:center}' +
    '.pagination{margin:1rem 0;display:flex;gap:0.5rem;align-items:center;justify-content:center}' +
    '.pagination button{padding:6px 12px;background:#334155;color:#e2e8f0;border:none;border-radius:4px;cursor:pointer}' +
    '.pagination button:hover{background:#475569}.pagination button:disabled{opacity:0.5;cursor:not-allowed}' +
    '.pagination span{color:#94a3b8}' +
    '.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:1000}' +
    '.modal-content{background:#1e293b;padding:2rem;border-radius:8px;max-width:600px;margin:10vh auto;max-height:80vh;overflow-y:auto}' +
    '.modal-content h2{margin-bottom:1rem;color:#3b82f6}' +
    '.modal-content .row{margin:0.5rem 0}.modal-content .label{color:#94a3b8;font-size:0.85rem}' +
    '.modal-content .value{color:#e2e8f0;font-weight:bold}' +
    '.modal-actions{margin-top:1rem;display:flex;gap:0.5rem}' +
    '.modal-actions button{padding:8px 16px;border:none;border-radius:4px;cursor:pointer}' +
    '.btn-print{background:#3b82f6;color:#fff}.btn-share{background:#10b981;color:#fff}.btn-close{background:#334155;color:#e2e8f0}' +
    '.debug{position:fixed;bottom:0;left:0;right:0;background:#1e293b;border:2px solid #ef4444;padding:0.5rem;font-size:0.8rem;max-height:100px;overflow-y:auto;display:none}' +
    '.debug.show{display:block}.debug .log{color:#fca5a5;margin:2px 0}' +
    '.progress-bar{width:100%;height:4px;background:#334155;margin:0.5rem 0;display:none}' +
    '.progress-bar.show{display:block}.progress-bar .fill{height:100%;background:#3b82f6;width:0%;transition:width 0.3s}' +
    '</style></head>' +
    '<body><div class="header"><h1>PRETASE</h1><a href="/" class="back">Kembali</a></div>' +
    '<div class="container">' +
    '<div class="toolbar">' +
    '<input type="text" id="search" placeholder="Search..." oninput="filterRows()">' +
    '<select id="filterSumber" onchange="filterRows()"><option value="">Semua Sumber</option></select>' +
    '<button onclick="downloadCSV()">Download CSV</button>' +
    '</div>' +
    '<div class="progress-bar" id="pb"><div class="fill" id="fill"></div></div>' +
    '<div class="table-wrap"><table id="tbl"><thead id="thead"></thead><tbody id="tbody"></tbody></table></div>' +
    '<div class="pagination" id="pag"></div>' +
    '</div>' +
    '<div class="modal" id="modal"><div class="modal-content" id="modalContent"></div></div>' +
    '<div class="debug" id="dbg"></div>' +
    '<script>' +
    'var SHEET_FILE="' + sheetFile + '";' +
    'var CDN_BASE="' + CDN_BASE + '";' +
    'var rows=[],filtered=[],page=1,perPage=15,sortCol=null,sortAsc=true;' +
    'function dbg(msg){var d=document.getElementById("dbg");d.classList.add("show");var l=document.createElement("div");l.className="log";l.textContent=msg;d.appendChild(l);d.scrollTop=d.scrollHeight;}' +
    'window.onerror=function(msg,url,line){dbg("Error: "+msg+" (line "+line+")");return false;};' +
    'function fmtNum(n){if(n===null||n===undefined)return"";return"Rp "+Number(n).toLocaleString("id-ID");}' +
    'function fmtDate(d){if(!d)return"";var dt=new Date(d);if(isNaN(dt))return d;return dt.toLocaleDateString("id-ID");}' +
    'function getStatus(r){if(!r.lunas||r.lunas==="")return"PROSES";if(r.lunas==="reject")return"REJECT";return"SUKSES";}' +
    'async function load(){try{dbg("Loading "+SHEET_FILE+"...");var res=await fetch(CDN_BASE+"/"+SHEET_FILE);if(!res.ok)throw new Error("HTTP "+res.status);var data=await res.json();rows=data.rows||[];dbg("Loaded "+rows.length+" rows");initSumber();render();}catch(e){dbg("Load error: "+e.message);document.getElementById("tbody").innerHTML="<tr><td colspan=\'14\'>Error: "+e.message+"</td></tr>";}}' +
    'function initSumber(){var s=new Set();rows.forEach(function(r){s.add(r.sumber||"");});var sel=document.getElementById("filterSumber");sel.innerHTML="<option value=\'\'>Semua Sumber</option>";Array.from(s).sort().forEach(function(v){var o=document.createElement("option");o.value=v;o.textContent=v;sel.appendChild(o);});}' +
    'function filterRows(){var q=document.getElementById("search").value.toLowerCase();var s=document.getElementById("filterSumber").value;filtered=rows.filter(function(r){if(s&&r.sumber!==s)return false;if(!q)return true;var vals=Object.values(r).join(" ").toLowerCase();return vals.indexOf(q)>-1;});page=1;render();}' +
    'function render(){var start=(page-1)*perPage;var slice=filtered.slice(start,start+perPage);renderHead();renderBody(slice);renderPag();}' +
    'function renderHead(){var cols=[{k:"no_urat",l:"No Urut"},{k:"ket",l:"Ket"},{k:"kebun",l:"Kebun"},{k:"nilai",l:"Nilai"},{k:"nama_rek",l:"Nama Rek"},{k:"bank_penerima",l:"Bank Penerima"},{k:"bank",l:"Bank"},{k:"no_rek",l:"No Rek"},{k:"kode_transfer",l:"Kode Transfer"},{k:"jenis_trx",l:"Jenis Trx"},{k:"lunas",l:"Lunas"},{k:"jumlah_transfer",l:"Jumlah Transfer"},{k:"fee",l:"Fee"},{k:"sumber",l:"Sumber"}];var h="<tr>";cols.forEach(function(c){var arrow=sortCol===c.k?(sortAsc?" ▲":" ▼"):"";h+="<th onclick=\'sort(\""+c.k+"\")\'>"+c.l+arrow+"</th>";});h+="<th>Aksi</th></tr>";document.getElementById("thead").innerHTML=h;}' +
    'function renderBody(slice){var h="";slice.forEach(function(r,i){var status=getStatus(r);h+="<tr><td>"+esc(r.no_urat)+"</td><td>"+esc(r.ket)+"</td><td>"+esc(r.kebun)+"</td><td class=\'num\'>"+fmtNum(r.nilai)+"</td><td>"+esc(r.nama_rek)+"</td><td>"+esc(r.bank_penerima)+"</td><td>"+esc(r.bank)+"</td><td>"+esc(r.no_rek)+"</td><td>"+esc(r.kode_transfer)+"</td><td>"+esc(r.jenis_trx)+"</td><td>"+fmtDate(r.lunas)+"</td><td class=\'num\'>"+fmtNum(r.jumlah_transfer)+"</td><td class=\'num\'>"+fmtNum(r.fee)+"</td><td>"+esc(r.sumber)+"</td><td><button onclick=\'showSlip("+(start+i)+")\'>View</button></td></tr>";});document.getElementById("tbody").innerHTML=h;}' +
    'function renderPag(){var total=Math.ceil(filtered.length/perPage);var h="<button onclick=\'goPage(1)\' "+(page<=1?"disabled":"")+">First</button>";h+="<button onclick=\'goPage(page-1)\' "+(page<=1?"disabled":"")+">Prev</button>";h+="<span>Page "+page+" / "+total+" ("+filtered.length+" rows)</span>";h+="<button onclick=\'goPage(page+1)\' "+(page>=total?"disabled":"")+">Next</button>";h+="<button onclick=\'goPage(total)\' "+(page>=total?"disabled":"")+">Last</button>";document.getElementById("pag").innerHTML=h;}' +
    'function goPage(p){var total=Math.ceil(filtered.length/perPage);if(p<1)p=1;if(p>total)p=total;page=p;render();}' +
    'function sort(col){if(sortCol===col)sortAsc=!sortAsc;else{sortCol=col;sortAsc=true;}filtered.sort(function(a,b){var va=a[col],vb=b[col];if(va===null||va===undefined)va="";if(vb===null||vb===undefined)vb="";if(typeof va==="number"&&typeof vb==="number")return sortAsc?va-vb:vb-va;return sortAsc?String(va).localeCompare(String(vb)):String(vb).localeCompare(String(va));});page=1;render();}' +
    'function showSlip(idx){var r=filtered[idx];if(!r)return;var status=getStatus(r);var html="<h2>Slip Transfer</h2>";html+="<div class=\'row\'><span class=\'label\'>Tanggal:</span> <span class=\'value\'>"+fmtDate(r.lunas)+"</span></div>";html+="<div class=\'row\'><span class=\'label\'>Status:</span> <span class=\'value\'>"+status+"</span></div>";html+="<div class=\'row\'><span class=\'label\'>Kode Transfer:</span> <span class=\'value\'>"+esc(r.kode_transfer)+"</span></div>";html+="<div class=\'row\'><span class=\'label\'>Pengirim:</span> <span class=\'value\'>"+esc(r.nama_rek)+" - "+esc(r.bank)+" - "+esc(r.no_rek)+"</span></div>";html+="<div class=\'row\'><span class=\'label\'>Penerima:</span> <span class=\'value\'>"+esc(r.bank_penerima)+" - "+esc(r.no_rek)+"</span></div>";html+="<div class=\'row\'><span class=\'label\'>Jumlah:</span> <span class=\'value\'>"+fmtNum(r.jumlah_transfer)+"</span></div>";html+="<div class=\'row\'><span class=\'label\'>Fee:</span> <span class=\'value\'>"+fmtNum(r.fee)+"</span></div>";html+="<div class=\'row\'><span class=\'label\'>Remarks:</span> <span class=\'value\'>"+esc(r.ket)+"</span></div>";html+="<div class=\'modal-actions\'><button class=\'btn-print\' onclick=\'window.print()\'>Print</button><button class=\'btn-share\' onclick=\'shareSlip()\'>Share</button><button class=\'btn-close\' onclick=\'closeModal()\'>Close</button></div>";document.getElementById("modalContent").innerHTML=html;document.getElementById("modal").style.display="block";}' +
    'function closeModal(){document.getElementById("modal").style.display="none";}' +
    'function shareSlip(){var c=document.getElementById("modalContent").innerText;var url="mailto:?subject=Slip Transfer&body="+encodeURIComponent(c);window.open(url);}' +
    'function downloadCSV(){var cols=["no_urat","ket","kebun","nilai","nama_rek","bank_penerima","bank","no_rek","kode_transfer","jenis_trx","lunas","jumlah_transfer","fee","sumber"];var csv=cols.join(",")+"\n";filtered.forEach(function(r){var row=cols.map(function(c){var v=r[c];if(v===null||v===undefined)v="";return"\""+String(v).replace(/"/g,"\"\"")+"\"";});csv+=row.join(",")+"\n";});var blob=new Blob([csv],{type:"text/csv"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=SHEET_FILE.replace(".json","")+".csv";a.click();}' +
    'load();' +
    '</script></body></html>',
    { headers: { "Content-Type": "text/html" } }
  );
}

async function handleLogin(request) {
  var formData = await request.formData();
  var username = formData.get("username");
  var password = formData.get("password");

  var user = USERS.find(function(u) {
    return u.username === username && u.password === password;
  });

  if (!user) {
    return new Response("Unauthorized", {
      status: 302,
      headers: { "Location": "/login?error=1" },
    });
  }

  var session = {
    username: user.username,
    role: user.role,
    lastActivity: Date.now(),
  };

  var encoded = btoa(JSON.stringify(session));

  return new Response("OK", {
    status: 302,
    headers: {
      "Location": "/",
      "Set-Cookie": "session=" + encoded + "; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict",
    },
  });
}

function handleLogout() {
  return new Response("OK", {
    status: 302,
    headers: {
      "Location": "/login",
      "Set-Cookie": "session=; Path=/; Max-Age=0",
    },
  });
}

export default {
  async fetch(request) {
    var url = new URL(request.url);
    var path = url.pathname;

    if (path === "/login") {
      return loginPage();
    }

    if (path === "/api/login" && request.method === "POST") {
      return handleLogin(request);
    }

    if (path === "/api/logout") {
      return handleLogout();
    }

    var session = getSession(request);
    if (!session) {
      return new Response("Unauthorized", {
        status: 302,
        headers: { "Location": "/login" },
      });
    }

    if (path === "/" || path === "/dashboard") {
      return dashboardPage(session);
    }

    if (path === "/sheet/") {
      var file = url.searchParams.get("f");
      if (!file) {
        return new Response("Bad Request", { status: 400 });
      }
      return sheetPage(file);
    }

    if (path === "/api/test") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
