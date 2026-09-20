// PRETASE Worker v8 - Clean single-file
// Auth + Dashboard + Sheet Viewer + Slip Modal

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/Jiganyusi/PRETASE@main/worker/sheets';

const USERS = [
  { username: 'DevPretase', password: 'test1234', role: 'owner' }
];

const SHEETS = [
  { name: 'Email CDP', file: 'email_cdp.json' },
  { name: 'Rekrut', file: 'rekrut.json' },
  { name: 'BAPP', file: 'bapp.json' },
  { name: 'COLA', file: 'cola.json' },
  { name: 'CS', file: 'cs.json' },
  { name: 'Kontanan', file: 'kontanan.json' },
  { name: 'Perdin RO', file: 'perdin_ro.json' },
  { name: 'Lain-Lain', file: 'lain-lain.json' },
];

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

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

async function handleLogin(request) {
  try {
    const { username, password } = await request.json();
    const user = USERS.find(u => u.username === username && u.password === password);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const session = { username: user.username, role: user.role, lastActivity: Date.now() };
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'session=' + btoa(JSON.stringify(session)) + '; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict',
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Bad request' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}

function handleLogout() {
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': 'session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict' },
  });
}

function loginPage() {
  return new Response('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Login</title><style>body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}.box{background:#1e293b;border:1px solid #334155;border-radius:1rem;padding:2rem;width:350px}h1{color:#fbbf24;text-align:center;margin-bottom:1rem}.i{width:100%;padding:0.75rem;margin:0.5rem 0;background:#0f172a;border:1px solid #334155;border-radius:0.5rem;color:#e2e8f0}.b{width:100%;padding:0.75rem;background:#3b82f6;color:#fff;border:none;border-radius:0.5rem;cursor:pointer}.e{background:#7f1d1d;color:#f87171;padding:0.5rem;border-radius:0.5rem;margin-bottom:1rem;display:none}</style></head><body><div class="box"><h1>PRETASE</h1><div class="e" id="err"></div><form id="f"><input class="i" type="text" id="u" placeholder="Username" required><input class="i" type="password" id="p" placeholder="Password" required><button class="b" type="submit">Login</button></form><script>document.getElementById("f").onsubmit=async function(e){e.preventDefault();var r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:document.getElementById("u").value,password:document.getElementById("p").value})});var d=await r.json();if(d.success)location.href="/";else{document.getElementById("err").textContent=d.error;document.getElementById("err").style.display="block"}}</script></div></body></html>', { headers: { 'Content-Type': 'text/html' } });
}

function dashboardPage(session) {
  const cards = SHEETS.map(function(s) {
    return '<div class="card" onclick="location.href=\'/sheet/?f=' + encodeURIComponent(s.file) + '\'"><h3>' + esc(s.name) + '</h3><p>Klik untuk lihat data</p></div>';
  }).join('');

  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>PRETASE</title><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;min-height:100vh}.header{background:linear-gradient(135deg,#1e293b,#0f172a);border-bottom:1px solid #334155;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}.header h1{color:#fbbf24;font-size:1.5rem}.user-info{display:flex;align-items:center;gap:1rem}.user-info span{color:#94a3b8}.btn{padding:0.5rem 1rem;border-radius:0.5rem;border:none;cursor:pointer;font-size:0.85rem}.btn-r{background:#dc2626;color:#fff}.container{padding:2rem;max-width:1200px;margin:0 auto}.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem}.card{background:#1e293b;border:1px solid #334155;border-radius:0.75rem;padding:1.25rem;cursor:pointer}.card:hover{border-color:#3b82f6}.card h3{color:#fbbf24;margin-bottom:0.5rem}.card p{color:#94a3b8;font-size:0.8rem}</style></head><body><div class="header"><h1>PRETASE</h1><div class="user-info"><span>' + esc(session.username) + ' (' + esc(session.role) + ')</span><button class="btn btn-r" onclick="logout()">Logout</button></div></div><div class="container"><h2 style="color:#fbbf24;margin-bottom:1rem">Daftar Sheet</h2><div class="cards">' + cards + '</div></div><script>async function logout(){await fetch("/api/logout");location.href="/login"}</script></body></html>';

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

function sheetPage(sheetFile) {
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + esc(sheetFile) + '</title><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;min-height:100vh}.header{background:linear-gradient(135deg,#1e293b,#0f172a);border-bottom:1px solid #334155;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}.header h1{color:#fbbf24;font-size:1.2rem}.btn{padding:0.5rem 1rem;border-radius:0.5rem;border:none;cursor:pointer;font-size:0.85rem}.btn-b{background:#334155;color:#e2e8f0}.btn-d{background:#059669;color:#fff}.btn-v{background:#3b82f6;color:#fff}.container{padding:1rem;max-width:1400px;margin:0 auto}.toolbar{display:flex;gap:0.5rem;margin-bottom:1rem;align-items:center}.toolbar input{padding:0.5rem;background:#1e293b;border:1px solid #334155;border-radius:0.5rem;color:#e2e8f0;flex:1;min-width:200px}.toolbar span{color:#94a3b8;font-size:0.85rem}.table-wrap{overflow-x:auto;border:1px solid #334155;border-radius:0.5rem;max-height:70vh;overflow-y:auto}table{width:100%;border-collapse:collapse;font-size:0.8rem}th{background:#1e293b;color:#94a3b8;padding:0.5rem;text-align:left;border-bottom:2px solid #334155;position:sticky;top:0;cursor:pointer}td{padding:0.4rem;border-bottom:1px solid #1e293b}.num{text-align:right;color:#fbbf24;font-weight:600}.badge{padding:0.15rem 0.4rem;border-radius:0.2rem;font-size:0.65rem;font-weight:600}.b-ift{background:#065f46;color:#34d399}.b-bif{background:#1e3a8a;color:#60a5fa}.b-klr{background:#7c2d12;color:#fb923c}.b-mass{background:#5b21b6;color:#c4b5fd}.pager{display:flex;gap:0.25rem;margin-top:1rem;justify-content:center}.pager button{background:#1e293b;color:#94a3b8;border:1px solid #334155;padding:0.3rem 0.6rem;border-radius:0.25rem;cursor:pointer}.pager button.active{background:#3b82f6;color:#fff}.loading{text-align:center;padding:2rem;color:#64748b}.spinner{width:30px;height:30px;border:3px solid #334155;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 0.5rem}@keyframes spin{to{transform:rotate(360deg)}}#slip{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:100;justify-content:center;align-items:center}#slip.show{display:flex}</style></head><body><div class="header"><h1>' + esc(sheetFile) + '</h1><button class="btn btn-b" onclick="location.href=\'/\'">Kembali</button></div><div class="container"><div class="toolbar"><input type="text" id="search" placeholder="Cari..."><button class="btn btn-d" id="dl">Download CSV</button><span id="status">Loading...</span></div><div class="table-wrap"><div id="table"><div class="loading"><div class="spinner"></div>Loading...</div></div></div><div class="pager" id="pager"></div></div><div id="slip"></div><script>var SHEET_FILE="' + esc(sheetFile) + '";var CDN_BASE="' + CDN_BASE + '";var rows=[],filtered=[],page=1,perPage=15,sortCol=0,sortAsc=true;function esc(s){var d=document.createElement("div");d.textContent=s==null?"":String(s);return d.innerHTML}async function load(){try{var r=await fetch(CDN_BASE+"/"+encodeURIComponent(SHEET_FILE));if(!r.ok)throw new Error("HTTP "+r.status);var d=await r.json();rows=d.rows||[];sortCol=0;sortAsc=false;filtered=rows.slice();document.getElementById("status").textContent=rows.length+" baris";render();renderPager()}catch(e){document.getElementById("table").innerHTML="<div class=\\"loading\\">Error: "+e.message+"</div>"}}function render(){var start=(page-1)*perPage;var slice=filtered.slice(start,start+perPage);var h="<table><thead><tr>";h+="<th onclick=\\"sortBy(0)\\">No Urut "+(sortCol===0?(sortAsc?"&#9650;":"&#9660;"):"")+"</th>";h+="<th onclick=\\"sortBy(1)\\">Ket</th><th onclick=\\"sortBy(2)\\">Kebun</th><th onclick=\\"sortBy(3)\\">Nilai</th><th onclick=\\"sortBy(4)\\">Nama Rek</th><th onclick=\\"sortBy(5)\\">Bank</th><th onclick=\\"sortBy(6)\\">No Rek</th><th onclick=\\"sortBy(7)\\">Kode Transfer</th><th onclick=\\"sortBy(8)\\">Jenis Trx</th><th onclick=\\"sortBy(9)\\">Lunas</th><th onclick=\\"sortBy(10)\\">Fee</th><th onclick=\\"sortBy(11)\\">Jumlah Transfer</th><th>Aksi</th></tr></thead><tbody>";slice.forEach(function(r,i){var ri=start+i;var kt=(r.kode_transfer||"").toUpperCase();var bc="b-mass";if(kt.startsWith("IFT"))bc="b-ift";else if(kt.startsWith("BIF"))bc="b-bif";else if(kt.startsWith("KLR"))bc="b-klr";h+="<tr><td>"+esc(r.no_urut)+"</td><td>"+esc(r.ket)+"</td><td>"+esc(r.kebun)+"</td><td class=\\"num\\">"+Number(r.nilai||0).toLocaleString("id-ID")+"</td><td>"+esc(r.nama_rek)+"</td><td>"+esc(r.bank)+"</td><td>"+esc(r.no_rek)+"</td><td><span class=\\"badge "+bc+"\\">"+esc(r.kode_transfer)+"</span></td><td>"+esc(r.jenis_trx)+"</td><td>"+esc(r.lunas)+"</td><td class=\\"num\\">"+Number(r.fee||0).toLocaleString("id-ID")+"</td><td class=\\"num\\">"+Number(r.jumlah_transfer||0).toLocaleString("id-ID")+"</td><td><button class=\\"btn btn-v\\" onclick=\\"viewSlip("+ri+")\\">View</button></td></tr>"});h+="</tbody></table>";document.getElementById("table").innerHTML=h;document.getElementById("status").textContent=filtered.length+" baris (page "+page+")"}function sortBy(c){if(sortCol===c)sortAsc=!sortAsc;else{sortCol=c;sortAsc=true}filtered.sort(function(a,b){var k=Object.keys(a);var va=a[k[c]]||"",vb=b[k[c]]||"";if(c===0||c===3||c===10||c===11){var na=parseFloat(String(va).replace(/[^0-9.-]/g,""))||0;var nb=parseFloat(String(vb).replace(/[^0-9.-]/g,""))||0;return sortAsc?na-nb:nb-na}return sortAsc?String(va).localeCompare(String(vb)):String(vb).localeCompare(String(va))});page=1;render();renderPager()}function renderPager(){var pages=Math.ceil(filtered.length/perPage);var h="";for(var i=1;i<=pages;i++)if(i===1||i===pages||Math.abs(i-page)<=2)h+="<button onclick=\\"goPage("+i+")\\" class=\\""+(i===page?"active":"")+"\\">"+i+"</button>";document.getElementById("pager").innerHTML=h}function goPage(p){page=p;render();renderPager()}document.getElementById("search").addEventListener("input",function(){var q=this.value.toLowerCase();filtered=q?rows.filter(function(r){return Object.values(r).some(function(v){return String(v||"").toLowerCase().indexOf(q)>=0})}):rows.slice();sortCol=0;sortAsc=false;filtered.sort(function(a,b){var va=parseFloat(String(a.no_urut||0).replace(/[^0-9.-]/g,""))||0;var vb=parseFloat(String(b.no_urut||0).replace(/[^0-9.-]/g,""))||0;return vb-va});page=1;render();renderPager()});document.getElementById("dl").onclick=function(){var hd=["No Urut","Ket","Kebun","Nilai","Nama Rek","Bank","No Rek","Kode Transfer","Jenis Trx","Lunas","Fee","Jumlah Transfer","Bank Penerima","Sumber"];var csv=[hd.join(",")];filtered.forEach(function(r){var cells=[r.no_urut,r.ket,r.kebun,r.nilai,r.nama_rek,r.bank,r.no_rek,r.kode_transfer,r.jenis_trx,r.lunas,r.fee,r.jumlah_transfer,r.bank_penerima,r.sumber].map(function(v){var s=String(v||"");return s.indexOf(",")>=0?"\\""+s+"\\"":s});csv.push(cells.join(","))});var blob=new Blob([csv.join(String.fromCharCode(10))],{type:"text/csv"});var a=document.createElement("a");a.download=SHEET_FILE.replace(".json","")+".csv";a.href=URL.createObjectURL(blob);a.click()};async function viewSlip(idx){var r=filtered[idx];if(!r)return;var slip=document.getElementById("slip");var tgl=r.lunas||"-",kode=r.kode_transfer||"-";var nilai=Number(r.nilai||0),fee=Number(r.fee||0),jumlah=Number(r.jumlah_transfer||0);var bank=r.bank||"-",bankPenerima=r.bank_penerima||"-",jenisTrx=r.jenis_trx||"-";var status=(tgl&&tgl!=="-"&&tgl!=="0")?(tgl.match(/^\d{4}-\d{2}-\d{4}/)?"SUKSES":tgl):"PROSES";var kt=kode.toUpperCase();var bc="b-mass";if(kt.startsWith("IFT"))bc="b-ift";else if(kt.startsWith("BIF"))bc="b-bif";else if(kt.startsWith("KLR"))bc="b-klr";var sc=status==="SUKSES"?"#34d399":"#fbbf24";var html="<div style=\\"background:linear-gradient(135deg,#1e3a8a,#1e293b);border:1px solid #3b82f6;border-radius:1rem;padding:1.5rem;position:relative\\">";html+="<button onclick=\\"document.getElementById('slip').classList.remove('show')\\" style=\\"position:absolute;top:0.5rem;right:1rem;background:none;border:none;color:#94a3b8;font-size:1.5rem;cursor:pointer\\">&times;</button>";html+="<h2 style=\\"color:#fbbf24;text-align:center;margin-bottom:1rem\\">BUKTI TRANSFER</h2>";html+="<div style=\\"text-align:center;margin-bottom:1rem\\"><span class=\\"badge "+bc+"\\" style=\\"font-size:0.7rem\\">"+esc(kode)+"</span></div>";html+="<table style=\\"width:100%;font-size:0.75rem\\">";html+="<tr><td style=\\"color:#94a3b8;padding:0.25rem 0\\">No Urut</td><td style=\\"text-align:right;font-weight:600\\">"+esc(r.no_urut)+"</td></tr>";html+="<tr><td style=\\"color:#94a3b8;padding:0.25rem 0\\">Ket</td><td style=\\"text-align:right;font-weight:600\\">"+esc(r.ket)+"</td></tr>";html+="<tr><td style=\\"color:#94a3b8;padding:0.25rem 0\\">Kebun</td><td style=\\"text-align:right;font-weight:600\\">"+esc(r.kebun)+"</td></tr>";html+="<tr><td style=\\"color:#94a3b8;padding:0.25rem 0\\">Nilai</td><td style=\\"text-align:right;font-weight:600;color:#fbbf24\\">Rp "+nilai.toLocaleString("id-ID")+"</td></tr>";html+="<tr><td style=\\"color:#94a3b8;padding:0.25rem 0\\">Fee</td><td style=\\"text-align:right;font-weight:600;color:#fbbf24\\">Rp "+fee.toLocaleString("id-ID")+"</td></tr>";html+="<tr><td style=\\"color:#94a3b8;padding:0.25rem 0\\">Jumlah Transfer</td><td style=\\"text-align:right;font-weight:700;color:#34d399;font-size:0.9rem\\">Rp "+jumlah.toLocaleString("id-ID")+"</td></tr>";html+="<tr><td style=\\"color:#94a3b8;padding:0.25rem 0\\">Bank</td><td style=\\"text-align:right;font-weight:600\\">"+esc(bank)+"</td></tr>";html+="<tr><td style=\\"color:#94a3b8;padding:0.25rem 0\\">No Rek</td><td style=\\"text-align:right;font-weight:600\\">"+esc(r.no_rek)+"</td></tr>";html+="<tr><td style=\\"color:#94a3b8;padding:0.25rem 0\\">Bank Penerima</td><td style=\\"text-align:right;font-weight:600\\">"+esc(bankPenerima)+"</td></tr>";html+="<tr><td style=\\"color:#94a3b8;padding:0.25rem 0\\">Jenis Trx</td><td style=\\"text-align:right;font-weight:600\\">"+esc(jenisTrx)+"</td></tr>";html+="<tr><td style=\\"color:#94a3b8;padding:0.25rem 0\\">Lunas</td><td style=\\"text-align:right;font-weight:600\\">"+esc(tgl)+"</td></tr>";html+="<tr><td style=\\"color:#94a3b8;padding:0.25rem 0\\">Status</td><td style=\\"text-align:right;font-weight:600;color:"+sc+"\\">"+status+"</td></tr>";html+="</table>";html+="<p style=\\"color:#64748b;font-size:0.65rem;text-align:center;margin-top:1rem\\">Dibuat oleh PRETASE</p>";html+="</div>";slip.innerHTML=html;slip.classList.add("show")}load();</script></body></html>';

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/login' && request.method === 'POST') return handleLogin(request);
    if (path === '/api/logout') return handleLogout();
    if (path === '/login') return loginPage();

    const session = getSession(request);
    if (!session) return new Response(null, { status: 302, headers: { Location: '/login' } });

    if (path === '/') return dashboardPage(session);
    if (path === '/sheet/') return sheetPage(url.searchParams.get('f') || 'email_cdp.json');

    return new Response('Not Found', { status: 404 });
  },
};