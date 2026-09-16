// PRETASE Worker v7 - Debug

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 jam (session timeout dimatikan sementara)

function generateToken() {
  let token = '';
  for (let i = 0; i < 32; i++) token += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 62));
  return token;
}

const USERS = [
  { username: 'DevPretase', password: 'test1234', role: 'owner' }
];

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Session
    const cookie = request.headers.get('Cookie') || '';
    const sessionMatch = cookie.match(/session=([^;]+)/);
    let session = null;
    if (sessionMatch) {
      try {
        session = JSON.parse(atob(sessionMatch[1]));
        if (Date.now() - session.lastActivity > SESSION_TIMEOUT) session = null;
      } catch { session = null; }
    }
    
    // API routes (BEFORE session check for sheet data)
    if (path.startsWith('/api/sheet/')) {
      const name = path.replace('/api/sheet/', '');
      try {
        const r = await fetch(`https://cdn.jsdelivr.net/gh/Jiganyusi/PRETASE@main/worker/sheets/${name}`);
        if (!r.ok) return new Response(JSON.stringify({ error: 'HTTP ' + r.status }), { status: 404 });
        const d = await r.json();
        return new Response(JSON.stringify(d), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }
    
    if (path === '/api/test') {
      return new Response(JSON.stringify({ ok: true, time: Date.now() }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    // Login
    if (path === '/login') {
      return new Response(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Login</title>
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
<script>document.getElementById('f').onsubmit=async function(e){e.preventDefault();const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:document.getElementById('u').value,password:document.getElementById('p').value})});const d=await r.json();if(d.success)location.href='/';else{document.getElementById('err').textContent=d.error;document.getElementById('err').style.display='block'}}</script></div></body></html>`, { headers: { 'Content-Type': 'text/html' } });
    }
    
    // Login API
    if (path === '/api/login' && request.method === 'POST') {
      try {
        const { username, password } = await request.json();
        const user = USERS.find(u => u.username === username && u.password === password);
        if (!user) return new Response(JSON.stringify({ success: false, error: 'Invalid' }), { status: 401 });
        const s = { username: user.username, role: user.role, lastActivity: Date.now(), token: generateToken() };
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', 'Set-Cookie': `session=${btoa(JSON.stringify(s))}; Path=/; Max-Age=${SESSION_TIMEOUT/1000}; SameSite=Strict; Secure` },
        });
      } catch { return new Response(JSON.stringify({ success: false }), { status: 400 }); }
    }
    
    // Logout
    if (path === '/api/logout') {
      return new Response(JSON.stringify({ success: true }), { headers: { 'Set-Cookie': `session=; Path=/; Max-Age=0` } });
    }
    
    if (!session) return new Response(null, { status: 302, headers: { 'Location': '/login' } });
    
    // Dashboard
    if (path === '/') {
      return new Response(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Dashboard</title>
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
.t{position:fixed;bottom:1rem;right:1rem;background:#1e293b;border:1px solid #334155;border-radius:0.5rem;padding:0.5rem 1rem;font-size:0.85rem}
button{border:none;padding:0.5rem 1rem;border-radius:0.5rem;cursor:pointer;font-size:0.85rem}
.b-r{background:#dc2626;color:#fff}
</style></head>
<body>
<div class="h"><h1>PRETASE</h1><div><span style="color:#94a3b8;margin-right:1rem">${session.username} (${session.role})</span><button class="b-r" onclick="fetch('/api/logout').then(()=>location.href='/login')">Logout</button></div></div>
<div class="c">
<div class="s">Sheet Tersedia</div><div class="g">
<div class="cd" onclick="location.href='/sheet/?f=email-cdp.json'"><h3>Email CDP</h3><p>Klik untuk lihat data</p></div>
<div class="cd" onclick="location.href='/sheet/?f=rekrut.json'"><h3>Rekrut</h3><p>Klik untuk lihat data</p></div>
<div class="cd" onclick="location.href='/sheet/?f=bapp.json'"><h3>BAPP</h3><p>Klik untuk lihat data</p></div>
<div class="cd" onclick="location.href='/sheet/?f=cola.json'"><h3>COLA</h3><p>Klik untuk lihat data</p></div>
<div class="cd" onclick="location.href='/sheet/?f=cs.json'"><h3>CS</h3><p>Klik untuk lihat data</p></div>
<div class="cd" onclick="location.href='/sheet/?f=kontanan.json'"><h3>Kontanan</h3><p>Klik untuk lihat data</p></div>
<div class="cd" onclick="location.href='/sheet/?f=perdin-ro.json'"><h3>Perdin RO</h3><p>Klik untuk lihat data</p></div>
<div class="cd" onclick="location.href='/sheet/?f=lain-lain.json'"><h3>Lain-Lain</h3><p>Klik untuk lihat data</p></div>
</div>
<div class="s">Menu</div><div class="g">
<div class="cd" onclick="location.href='/upload'"><h3>Upload</h3><p>Upload file Excel</p></div>
<div class="cd" onclick="location.href='/cek-rekening'"><h3>Cek Rekening</h3><p>Cari data rekening</p></div>
</div></div>
<div class="t" id="t" style="display:none">Session: disabled</div>
<script>/* session timer disabled */</script>
</body></html>`, { headers: { 'Content-Type': 'text/html' } });
    }
    
    // Sheet viewer
        if (path.startsWith('/sheet')) {
          const sheetFile = url.searchParams.get('f') || 'email-cdp.json';
      
          return new Response(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0"><title>${sheetFile}</title>
<style>
body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;margin:0}
.h{background:linear-gradient(135deg,#1e293b,#0f172a);border-bottom:1px solid #334155;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}
h1{color:#f8fafc;font-size:1.2rem;margin:0}
.c{padding:1rem;max-width:1400px;margin:0 auto}
.i{padding:0.5rem;background:#1e293b;border:1px solid #334155;border-radius:0.5rem;color:#e2e8f0;flex:1;min-width:200px}
button{border:none;padding:0.5rem 1rem;border-radius:0.5rem;cursor:pointer;font-size:0.85rem}
.b-b{background:#334155;color:#e2e8f0}
.b-d{background:#059669;color:#fff}
.b-v{background:#3b82f6;color:#fff}
.ov{overflow-x:auto;border:1px solid #334155;border-radius:0.5rem;max-height:70vh;overflow-y:auto}
table{width:100%;border-collapse:collapse;font-size:0.85rem}
th{background:#1e293b;color:#94a3b8;padding:0.5rem;text-align:left;border-bottom:2px solid #334155;position:sticky;top:0;cursor:pointer;user-select:none}
td{padding:0.5rem;border-bottom:1px solid #1e293b}
.cur{text-align:right;color:#fbbf24;font-weight:600}
.lod{text-align:center;padding:2rem;color:#64748b}
.spr{width:30px;height:30px;border:3px solid #334155;border-top-color:#3b82f6;border-radius:50%;animation:s 1s linear infinite;margin:0 auto 0.5rem}
@keyframes s{to{transform:rotate(360deg)}}
.bg{padding:0.15rem 0.4rem;border-radius:0.2rem;font-size:0.7rem;font-weight:600}
.bi{background:#065f46;color:#34d399}
.bo{background:#1e3a8a;color:#60a5fa}
.pg{display:flex;gap:0.25rem;margin-top:1rem;justify-content:center;flex-wrap:wrap}
.pg button{background:#1e293b;color:#94a3b8;border:1px solid #334155;padding:0.3rem 0.6rem;border-radius:0.25rem;cursor:pointer}
.pb{background:#0f172a;border-radius:0.5rem;height:24px;overflow:hidden;margin-bottom:0.5rem;position:relative}
.pb #fill{height:100%;background:linear-gradient(90deg,#3b82f6,#06b6d4);width:0%;transition:width 0.3s;font-size:0.7rem;font-weight:600;color:#fff;display:flex;align-items:center;justify-content:center}
.pg button.ac{background:#3b82f6;color:#fff}
.t{position:fixed;bottom:1rem;right:1rem;background:#1e293b;border:1px solid #334155;border-radius:0.5rem;padding:0.5rem 1rem;font-size:0.85rem}
/* Modal */
.md{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:100;justify-content:center;align-items:center}
.md.ac{display:flex}
.md-b{background:#1e293b;border:1px solid #334155;border-radius:1rem;padding:1.5rem;max-width:420px;width:90%;max-height:90vh;overflow-y:auto;position:relative}
.md-x{position:absolute;top:0.5rem;right:1rem;background:none;border:none;color:#94a3b8;font-size:1.5rem;cursor:pointer}
.sl{background:linear-gradient(135deg,#1e3a8a,#1e293b);border:1px solid #3b82f6;border-radius:0.75rem;padding:1rem;margin-bottom:0.5rem}
.sl-h{text-align:center;margin-bottom:0.5rem;border-bottom:1px solid #334155;padding-bottom:0.5rem}
.sl-h h2{color:#fbbf24;font-size:0.95rem;margin-bottom:0.15rem}
.sl-h p{color:#94a3b8;font-size:0.75rem}
.sl-r{display:flex;justify-content:space-between;padding:0.3rem 0;border-bottom:1px solid #334155;font-size:0.78rem}
.sl-r:last-child{border-bottom:none}
.sl-l{color:#94a3b8}
.sl-v{color:#e2e8f0;font-weight:600;text-align:right}
.sl-v.mk{font-family:monospace;letter-spacing:1px}
.sl-t{background:#0f172a;border:1px solid #3b82f6;border-radius:0.4rem;padding:0.5rem;margin-top:0.5rem}
.sl-t .sl-l{color:#fbbf24;font-weight:600}
.sl-s{text-align:center;padding:0.3rem;border-radius:0.4rem;margin-top:0.5rem;font-weight:600;font-size:0.78rem}
.sl-s.ok{background:#065f46;color:#34d399}
.sl-s.wn{background:#78350f;color:#fbbf24}
</style></head>
<body>
<div class="h"><h1>${sheetFile.replace('.json','')}</h1><button class="b-b" onclick="location.href='/'">Kembali</button></div>

<div class="c">
<div style="display:flex;gap:0.5rem;margin-bottom:1rem;align-items:center">
<input class="i" type="text" id="s" placeholder="Cari...">
<button class="b-d" id="dl">Download CSV</button>
<span style="color:#94a3b8;font-size:0.85rem" id="st">Loading...</span>
</div>
<div class="pb" id="pb" style="display:none"><div id="fill" style="width:0%"></div></div>
<div id="debug" style="background:#1e293b;border:1px solid #ef4444;border-radius:0.5rem;padding:0.5rem;margin-bottom:0.5rem;font-size:0.7rem;color:#fca5a5;max-height:150px;overflow-y:auto;display:block"></div>
<div class="ov"><div id="ct"><div class="lod"><div class="spr"></div>Loading...</div></div></div>
<div class="pg" id="pg"></div>
</div>
<div class="t" id="t" style="display:none">Session: disabled</div>
<!-- Modal -->
<div class="md" id="md">
  <div class="md-b">
    <button class="md-x" onclick="closeMd()">&times;</button>
    <div id="slip"></div>
  </div>
</div>
<script>
(function(){
function dbg(m){console.log('[PRETASE]',m);var d=document.getElementById('debug');if(d){d.innerHTML+='['+new Date().toLocaleTimeString()+'] '+m+'<br>';d.scrollTop=d.scrollHeight;}}
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
window.onerror=function(m,s,l,c,e){dbg('[ERROR] '+m+' (line '+l+':'+c+') '+e);return false;};
window.addEventListener('unhandledrejection',function(e){dbg('[PROMISE] '+(e.reason&&e.reason.message||JSON.stringify(e.reason)));});

var rows=[],filtered=[],pg=1,pp=15,sc=0,sa=true;
var rek={};
var SHEET_FILE='${sheetFile}';
dbg('JS init — page='+document.title+' sheet='+SHEET_FILE);

async function load(){
dbg('load() start — sheet='+document.title);
document.getElementById('st').textContent='Loading...';
try{
var apiUrl='/api/sheet/'+encodeURIComponent(SHEET_FILE);
dbg('API URL: '+apiUrl);
var r=await fetch(apiUrl,{credentials:'include'});
dbg('fetch status: '+r.status);
if(!r.ok){dbg('HTTP ERROR: '+r.status);document.getElementById('ct').innerHTML='<div class="lod">Error HTTP '+r.status+'</div>';return;}
var d=await r.json();
dbg('JSON keys: '+Object.keys(d).join(', '));
rows=d.rows||[];
filtered=rows;
dbg('rows: '+rows.length);
document.getElementById('st').textContent=rows.length+' rows';
render();
renderPg();
}catch(e){dbg('LOAD ERROR: '+e.message+' '+e.stack);document.getElementById('ct').innerHTML='<div class="lod">Error: '+esc(e.message)+'</div>'}
}

function sort(){
filtered.sort(function(a,b){var va=a[sc]||'',vb=b[sc]||'';if(sc===0||sc===3){var na=parseFloat(String(va).replace(/[^0-9.-]/g,''))||0,nb=parseFloat(String(vb).replace(/[^0-9.-]/g,''))||0;if(na!==nb)return sa?na-nb:nb-na;}if(va<vb)return sa?-1:1;if(va>vb)return sa?1:-1;return 0;});
}

function render(){
var start=(pg-1)*pp,end=Math.min(start+pp,filtered.length);
var f=filtered.slice(start,end);
dbg('render page '+pg+' ('+start+'-+end+')');
var h='<table><thead><tr>';
h+='<th data-col="0">No Urut '+(sc===0?(sa?'&#9650;':'&#9660;'):'')+'</th>';
h+='<th data-col="1">Ket</th>';
h+='<th data-col="2">Kebun</th>';
h+='<th data-col="3">Nilai '+(sc===3?(sa?'&#9650;':'&#9660;'):'')+'</th>';
h+='<th data-col="4">Nama Rek</th>';
h+='<th data-col="5">Bank</th>';
h+='<th data-col="6">No Rek</th>';
h+='<th data-col="7">Jenis Trx</th>';
h+='<th data-col="8">Lunas '+(sc===8?(sa?'&#9650;':'&#9660;'):'')+'</th>';
h+='<th>Aksi</th></tr></thead><tbody>';
f.forEach(function(r,idx){
var ri=start+idx;
h+='<tr>';
h+='<td>'+esc(r[0]||'')+'</td>';
h+='<td>'+esc(r[1]||'')+'</td>';
h+='<td>'+esc(r[2]||'')+'</td>';
h+='<td class="cur">'+Number(String(r[3]||'0').replace(/[^0-9]/g,'')).toLocaleString('id-ID')+'</td>';
h+='<td>'+esc(r[4]||'')+'</td>';
h+='<td>'+esc(r[5]||'')+'</td>';
h+='<td>'+esc(r[6]||'')+'</td>';
var trx=String(r[7]||'').toUpperCase();
h+='<td><span class="bg '+(trx.indexOf('IFT')>=0?'bi':'bo')+'">'+esc(r[7]||'')+'</span></td>';
h+='<td>'+esc(r[8]||'')+'</td>';
h+='<td><button class="b-v" onclick="showSlip('+ri+')">View</button></td>';
h+='</tr>';
});
h+='</tbody></table>';
document.getElementById('ct').innerHTML=h;
document.getElementById('st').textContent=filtered.length+' rows (page '+pg+')';
document.querySelectorAll('th[data-col]').forEach(function(th){
th.onclick=function(){var c=parseInt(th.dataset.col);if(sc===c)sa=!sa;else{sc=c;sa=true;}sort();render();renderPg();};
});
}

function renderPg(){
var p=Math.ceil(filtered.length/pp);
var h='';
for(var i=1;i<=p;i++)if(i===1||i===p||Math.abs(i-pg)<=2)h+='<button onclick="pg='+i+';render();renderPg()" class="'+(i===pg?'ac':'')+'">'+i+'</button>';
document.getElementById('pg').innerHTML=h;
}

function doSearch(){
var q=document.getElementById('s').value.toLowerCase();
filtered=q?rows.filter(function(r){return r.some(function(c){return String(c||'').toLowerCase().indexOf(q)>=0;})}):rows;
pg=1;render();renderPg();
}

document.getElementById('s').addEventListener('input',doSearch);

document.getElementById('dl').onclick=function(){
var csv=[['No','Ket','Kebun','Nilai','Nama Rek','Bank','No Rek','Jenis Trx','Lunas'].join(',')];
filtered.forEach(function(r){
var cells=r.map(function(v){var s=String(v||'');if(s.indexOf(',')>=0)s='"'+s+'"';return s;});
csv.push(cells.join(','));
});
var blob=new Blob([csv.join(String.fromCharCode(10))],{type:'text/csv'});
var a=document.createElement('a');a.download=''+document.title.replace(/\s+/g,'_')+'_'+new Date().toISOString().slice(0,10)+'.csv';a.href=URL.createObjectURL(blob);a.click();
};

window.showSlip=function(idx){
var r=filtered[idx];
if(!r){dbg('showSlip: row '+idx+' not found');return;}
var tgl=r[8]||'-',kode=r[7]||'-',kebun=r[2]||'';
var nilai=Number(String(r[3]||'0').replace(/[^0-9]/g,''))||0;
var nm=r[4]||'-',bank=r[5]||'-',norek=r[6]||'-',ket=r[1]||'-';
var s=rek[kebun]||{nama:kebun,no_rek:'-',bank:'-'};
var sNm=s.nama||kebun,sRk=s.no_rek||'-',sBk=s.bank||'-';
var mk=sRk.length>=7?sRk.substring(0,4)+'****'+sRk.slice(-3):sRk;
var st='PROSES',sc='wn';
if(tgl&&tgl!=='0'){
var tglStr=String(tgl);
if(/^\d{2}-\d{2}-\d{4}$/.test(tglStr)){st='SUKSES';sc='ok';}
else{st=tglStr;}
}
var fee=0;var ku=String(kode||'').toUpperCase();
if(ku.indexOf('BIF')===0)fee=2500;else if(ku.indexOf('KLR')===0)fee=2900;
var gt=nilai+fee;
var h='<div class="sl">'+
'<div class="sl-h"><h2>BUKTI TRANSFER</h2><p>PRETASE</p></div>'+
'<div class="sl-r"><span class="sl-l">Tanggal</span><span class="sl-v">'+esc(tgl)+'</span></div>'+
'<div class="sl-r"><span class="sl-l">Status</span><span class="sl-v">'+st+'</span></div>'+
'<div class="sl-r"><span class="sl-l">Kode Transfer</span><span class="sl-v">'+esc(kode)+'</span></div>'+
'<div class="sl-r"><span class="sl-l">Pengirim</span><span class="sl-v">'+esc(sNm)+'</span></div>'+
'<div class="sl-r"><span class="sl-l">Bank Pengirim</span><span class="sl-v">'+esc(sBk)+'</span></div>'+
'<div class="sl-r"><span class="sl-l">No. Rek Pengirim</span><span class="sl-v mk">'+mk+'</span></div>'+
'<div class="sl-r"><span class="sl-l">Penerima</span><span class="sl-v">'+esc(nm)+'</span></div>'+
'<div class="sl-r"><span class="sl-l">Bank</span><span class="sl-v">'+esc(bank)+'</span></div>'+
'<div class="sl-r"><span class="sl-l">No. Rek</span><span class="sl-v">'+esc(norek)+'</span></div>'+
'<div class="sl-t"><div class="sl-r"><span class="sl-l">Jumlah</span><span class="sl-v">Rp '+nilai.toLocaleString('id-ID')+'</span></div>'+
'<div class="sl-r"><span class="sl-l">Fee</span><span class="sl-v">Rp '+fee.toLocaleString('id-ID')+'</span></div>'+
'<div class="sl-r"><span class="sl-l">Grand Total</span><span class="sl-v">Rp '+gt.toLocaleString('id-ID')+'</span></div></div>'+
'<div class="sl-r"><span class="sl-l">Remarks</span><span class="sl-v">'+esc(ket)+'</span></div>'+
'<div class="sl-s '+sc+'">'+st+'</div></div>';
document.getElementById('slip').innerHTML=h;
document.getElementById('md').classList.add('ac');
};

function closeMd(){document.getElementById('md').classList.remove('ac');}
document.getElementById('md').addEventListener('click',function(e){if(e.target===e.currentTarget)closeMd();});

fetch('/api/sheet/m-rekening.json').then(function(r){return r.json()}).then(function(d){rek=d;}).catch(function(e){dbg('M-REKENING ERROR: '+e.message);});

load();
})();
</script>
</body></html>`, { headers: { 'Content-Type': 'text/html' } });
    }
    // Cek Rekening
    if (path === '/cek-rekening') {
      return new Response(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Cek Rekening</title>
<style>
body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;margin:0}
.h{background:linear-gradient(135deg,#1e293b,#0f172a);border-bottom:1px solid #334155;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}
h1{color:#f8fafc;font-size:1.2rem;margin:0}
.c{padding:2rem;max-width:600px;margin:0 auto}
.i{width:100%;padding:0.75rem;background:#1e293b;border:1px solid #334155;border-radius:0.5rem;color:#e2e8f0;box-sizing:border-box;font-size:1rem;margin-bottom:1rem}
.r{background:#1e293b;border:1px solid #334155;border-radius:0.75rem;padding:1rem;margin-top:1rem}
.r h3{color:#fbbf24;margin-bottom:0.5rem}
.row{display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid #334155}
.row:last-child{border-bottom:none}
.l{color:#94a3b8}
.v{color:#e2e8f0;font-weight:600}
.nf{text-align:center;color:#f87171;padding:1rem}
.hint{color:#64748b;text-align:center;padding:1rem}
button{border:none;padding:0.5rem 1rem;border-radius:0.5rem;cursor:pointer;font-size:0.85rem}
.b-b{background:#334155;color:#e2e8f0}
.t{position:fixed;bottom:1rem;right:1rem;background:#1e293b;border:1px solid #334155;border-radius:0.5rem;padding:0.5rem 1rem;font-size:0.85rem}
</style></head>
<body>
<div class="h"><h1>Cek Rekening</h1><button class="b-b" onclick="location.href='/'">Kembali</button></div>
<div class="c">
<input class="i" type="text" id="q" placeholder="No. Rekening / Nama / Bank / Code..." onkeyup="if(event.key==='Enter')search()">
<div class="r" id="res"><div class="hint">Masukkan kata kunci untuk mencari</div></div>
</div>
<div class="t" id="t" style="display:none">Session: disabled</div>
<script>
let rek={};
fetch('/api/sheet/m-rekening.json').then(r=>r.json()).then(d=>{rek=d}).catch(()=>{});

function search(){
const q=document.getElementById('q').value.toLowerCase().trim();
const res=document.getElementById('res');
if(!q){res.innerHTML='<div class="hint">Masukkan kata kunci</div>';return}
const r=Object.entries(rek).filter(([c,d])=>c.toLowerCase().includes(q)||(d.nama||'').toLowerCase().includes(q)||(d.no_rek||'').includes(q)||(d.bank||'').toLowerCase().includes(q));
if(r.length===0){res.innerHTML='<div class="nf">Tidak ditemukan</div>';return}
let h='<h3>'+r.length+' ditemukan</h3>';
r.forEach(([c,d])=>{
h+='<div class="row"><span class="l">Code</span><span class="v">'+c+'</span></div>';
h+='<div class="row"><span class="l">Nama</span><span class="v">'+(d.nama||'')+'</span></div>';
h+='<div class="row"><span class="l">No. Rek</span><span class="v">'+(d.no_rek||'')+'</span></div>';
h+='<div class="row"><span class="l">Bank</span><span class="v">'+(d.bank||'')+'</span></div><hr style="border-color:#334155;margin:0.5rem 0">';
});
res.innerHTML=h;
}

let t=300;/* session timer disabled */
document.addEventListener('click',()=>{t=300;document.getElementById('t').style.color='#e2e8f0'});
</script>
</body></html>`, { headers: { 'Content-Type': 'text/html' } });
    }
    
    // Upload
    if (path === '/upload') {
      return new Response(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Upload</title>
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
.note{color:#64748b;font-size:0.85rem;margin-top:1rem}
button{border:none;padding:0.5rem 1rem;border-radius:0.5rem;cursor:pointer;font-size:0.85rem}
.b-b{background:#334155;color:#e2e8f0}
.t{position:fixed;bottom:1rem;right:1rem;background:#1e293b;border:1px solid #334155;border-radius:0.5rem;padding:0.5rem 1rem;font-size:0.85rem}
</style></head>
<body>
<div class="h"><h1>Upload</h1><button class="b-b" onclick="location.href='/'">Kembali</button></div>
<div class="c">
<div class="a" onclick="document.getElementById('f').click()"><h3>Pilih File</h3><p>.xlsx / .xls (max 10MB)</p><input type="file" id="f" accept=".xlsx,.xls" onchange="upload(this.files[0])"></div>
<div class="bar" id="bar"><div id="fill"></div></div>
<div class="sta" id="sta"></div>
<p class="note">Setelah upload, JSON di-regenerate GitHub Actions (1-2 menit)</p>
</div>
<div class="t" id="t" style="display:none">Session: disabled</div>
<script>
function upload(file){
if(!file)return;
if(!file.name.match(/\\.(xlsx|xls)$/i)){show('er','Format tidak didukung');return}
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

let t=300;/* session timer disabled */
document.addEventListener('click',()=>{t=300;document.getElementById('t').style.color='#e2e8f0'});
</script>
</body></html>`, { headers: { 'Content-Type': 'text/html' } });
    }
    
    // API: Upload
    if (path === '/api/upload' && request.method === 'POST') {
      try {
        const fd = await request.formData();
        const file = fd.get('file');
        if (!file) return new Response('No file', { status: 400 });
        const buf = await file.arrayBuffer();
        let bin = '';
        const arr = new Uint8Array(buf);
        for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
        const b64 = btoa(bin);
        const fileName = file.name;
        const url = 'https://api.github.com/repos/Jiganyusi/PRETASE/contents/' + encodeURIComponent(fileName);
        const g = await fetch(url, { headers: { 'Authorization': 'token ' + env.GITHUB_TOKEN } });
        let sha = null;
        if (g.ok) { const gd = await g.json(); sha = gd.sha; }
        const u = await fetch(url, {
          method: 'PUT',
          headers: { 'Authorization': 'token ' + env.GITHUB_TOKEN, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Upload ' + fileName, content: b64, sha }),
        });
        if (!u.ok) return new Response(JSON.stringify({ error: await u.text() }), { status: 500 });
        return new Response(JSON.stringify({ success: true }));
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }
    
    return new Response('Not Found', { status: 404 });
  },
};
