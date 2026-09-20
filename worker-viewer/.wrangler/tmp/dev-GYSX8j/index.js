var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
var CDN_BASE = "https://cdn.jsdelivr.net/gh/Jiganyusi/PRETASE@main/worker/sheets";
var USERS = [
  { username: "DevPretase", password: "test1234", role: "owner" }
];
var SHEETS = [
  { name: "Email CDP", file: "email_cdp.json" },
  { name: "Rekrut", file: "rekrut.json" },
  { name: "BAPP", file: "bapp.json" },
  { name: "COLA", file: "cola.json" },
  { name: "CS", file: "cs.json" },
  { name: "Kontanan", file: "kontanan.json" },
  { name: "Perdin RO", file: "perdin_ro.json" },
  { name: "Lain-Lain", file: "lain-lain.json" }
];
function getSession(request) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    const s = JSON.parse(atob(match[1]));
    if (Date.now() - s.lastActivity > 864e5) return null;
    return s;
  } catch (e) {
    return null;
  }
}
__name(getSession, "getSession");
async function handleLogin(request) {
  try {
    const { username, password } = await request.json();
    const user = USERS.find((u) => u.username === username && u.password === password);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const session = { username: user.username, role: user.role, lastActivity: Date.now() };
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Set-Cookie": "session=" + btoa(JSON.stringify(session)) + "; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: "Bad request" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
__name(handleLogin, "handleLogin");
function handleLogout() {
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json", "Set-Cookie": "session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict" }
  });
}
__name(handleLogout, "handleLogout");
function loginPage() {
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Login</title>
<style>
body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{background:#1e293b;border:1px solid #334155;border-radius:1rem;padding:2rem;width:350px}
h1{color:#fbbf24;text-align:center;margin-bottom:1rem}
.i{width:100%;padding:0.75rem;margin:0.5rem 0;background:#0f172a;border:1px solid #334155;border-radius:0.5rem;color:#e2e8f0;box-sizing:border-box}
.b{width:100%;padding:0.75rem;background:#3b82f6;color:#fff;border:none;border-radius:0.5rem;font-size:1rem;cursor:pointer;margin-top:0.5rem}
.e{background:#7f1d1d;color:#f87171;padding:0.5rem;border-radius:0.5rem;margin-bottom:1rem;display:none}
</style></head>
<body>
<div class="box">
  <h1>PRETASE</h1>
  <div class="e" id="err"></div>
  <form id="f">
    <input class="i" type="text" id="u" placeholder="Username" required>
    <input class="i" type="password" id="p" placeholder="Password" required>
    <button class="b" type="submit">Login</button>
  </form>
  <script>
    document.getElementById("f").onsubmit=async function(e){
      e.preventDefault();
      var r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:document.getElementById("u").value,password:document.getElementById("p").value})});
      var d=await r.json();
      if(d.success)location.href="/";
      else{document.getElementById("err").textContent=d.error;document.getElementById("err").style.display="block"}
    }
  <\/script>
</div>
</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
__name(loginPage, "loginPage");
function dashboardPage(session) {
  const cards = SHEETS.map((s) => {
    return `<div class="card" onclick="location.href='/sheet/?f=` + encodeURIComponent(s.file) + `'"><h3>` + s.name + "</h3><p>Klik untuk lihat data</p></div>";
  }).join("");
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>PRETASE</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;min-height:100vh}
.header{background:linear-gradient(135deg,#1e293b,#0f172a);border-bottom:1px solid #334155;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}
.header h1{color:#fbbf24;font-size:1.5rem}
.user-info{display:flex;align-items:center;gap:1rem}
.user-info span{color:#94a3b8}
.btn{padding:0.5rem 1rem;border-radius:0.5rem;border:none;cursor:pointer;font-size:0.85rem}
.btn-r{background:#dc2626;color:#fff}
.container{padding:2rem;max-width:1200px;margin:0 auto}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem}
.card{background:#1e293b;border:1px solid #334155;border-radius:0.75rem;padding:1.25rem;cursor:pointer}
.card:hover{border-color:#3b82f6}
.card h3{color:#fbbf24;margin-bottom:0.5rem;font-size:1rem}
.card p{color:#94a3b8;font-size:0.8rem}
</style></head>
<body>
<div class="header">
  <h1>PRETASE</h1>
  <div class="user-info">
    <span>` + session.username + " (" + session.role + `)</span>
    <button class="btn btn-r" onclick="logout()">Logout</button>
  </div>
</div>
<div class="container">
  <h2 style="color:#fbbf24;margin-bottom:1rem;border-bottom:1px solid #334155;padding-bottom:0.5rem">Daftar Sheet</h2>
  <div class="cards">` + cards + `</div>
</div>
<script>
  async function logout(){await fetch("/api/logout");location.href="/login"}
<\/script>
</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
__name(dashboardPage, "dashboardPage");
function sheetPage(sheetFile) {
  const title = sheetFile.replace(".json", "");
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>` + title + `</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;min-height:100vh}
.header{background:linear-gradient(135deg,#1e293b,#0f172a);border-bottom:1px solid #334155;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}
.header h1{color:#fbbf24;font-size:1.2rem}
.btn{padding:0.5rem 1rem;border-radius:0.5rem;border:none;cursor:pointer;font-size:0.85rem}
.btn-b{background:#334155;color:#e2e8f0}
.btn-d{background:#059669;color:#fff}
.btn-v{background:#3b82f6;color:#fff}
.container{padding:1rem;max-width:1400px;margin:0 auto}
.toolbar{display:flex;gap:0.5rem;margin-bottom:1rem;align-items:center}
.toolbar input{padding:0.5rem;background:#1e293b;border:1px solid #334155;border-radius:0.5rem;color:#e2e8f0;flex:1;min-width:200px}
.toolbar span{color:#94a3b8;font-size:0.85rem}
.table-wrap{overflow-x:auto;border:1px solid #334155;border-radius:0.5rem;max-height:70vh;overflow-y:auto}
table{width:100%;border-collapse:collapse;font-size:0.8rem}
th{background:#1e293b;color:#94a3b8;padding:0.5rem;text-align:left;border-bottom:2px solid #334155;position:sticky;top:0;cursor:pointer;user-select:none}
td{padding:0.4rem;border-bottom:1px solid #1e293b}
.num{text-align:right;color:#fbbf24;font-weight:600}
.badge{padding:0.15rem 0.4rem;border-radius:0.2rem;font-size:0.65rem;font-weight:600}
.b-ift{background:#065f46;color:#34d399}
.b-bif{background:#1e3a8a;color:#60a5fa}
.b-klr{background:#7c2d12;color:#fb923c}
.b-mass{background:#5b21b6;color:#c4b5fd}
.pager{display:flex;gap:0.25rem;margin-top:1rem;justify-content:center;flex-wrap:wrap}
.pager button{background:#1e293b;color:#94a3b8;border:1px solid #334155;padding:0.3rem 0.6rem;border-radius:0.25rem;cursor:pointer}
.pager button.active{background:#3b82f6;color:#fff}
.loading{text-align:center;padding:2rem;color:#64748b}
.spinner{width:30px;height:30px;border:3px solid #334155;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 0.5rem}
@keyframes spin{to{transform:rotate(360deg)}}
</style></head>
<body>
<div class="header"><h1>` + title + `</h1><button class="btn btn-b" onclick="location.href='/'">Kembali</button></div>
<div class="container">
  <div class="toolbar">
    <input type="text" id="search" placeholder="Cari...">
    <button class="btn btn-d" id="dl">Download CSV</button>
    <span id="status">Loading...</span>
  </div>
  <div class="table-wrap"><div id="table"><div class="loading"><div class="spinner"></div>Loading...</div></div></div>
  <div class="pager" id="pager"></div>
</div>
<script>
var SHEET_FILE="` + sheetFile + `";
var CDN_BASE="` + CDN_BASE + `";
var rows=[],filtered=[],page=1,perPage=15,sortCol=0,sortAsc=true;

async function load(){
  try{
    var r=await fetch(CDN_BASE+"/"+encodeURIComponent(SHEET_FILE));
    if(!r.ok)throw new Error("HTTP "+r.status);
    var d=await r.json();
    rows=d.rows||[];
    sortCol=0;sortAsc=false;
    filtered=rows.slice();
    document.getElementById("status").textContent=rows.length+" baris";
    render();renderPager();
  }catch(e){
    document.getElementById("table").innerHTML='<div class="loading">Error: '+e.message+'</div>';
  }
}

function render(){
  var start=(page-1)*perPage;
  var slice=filtered.slice(start,start+perPage);
  var h='<table><thead><tr>';
  h+='<th onclick="sortBy(0)">No Urut '+(sortCol===0?(sortAsc?'&#9650;':'&#9660;'):'')+'</th>';
  h+='<th onclick="sortBy(1)">Ket</th>';
  h+='<th onclick="sortBy(2)">Kebun</th>';
  h+='<th onclick="sortBy(3)">Nilai</th>';
  h+='<th onclick="sortBy(4)">Nama Rek</th>';
  h+='<th onclick="sortBy(5)">Bank</th>';
  h+='<th onclick="sortBy(6)">No Rek</th>';
  h+='<th onclick="sortBy(7)">Kode Transfer</th>';
  h+='<th onclick="sortBy(8)">Jenis Trx</th>';
  h+='<th onclick="sortBy(9)">Lunas</th>';
  h+='<th onclick="sortBy(10)">Fee</th>';
  h+='<th onclick="sortBy(11)">Jumlah Transfer</th>';
  h+='<th>Aksi</th></tr></thead><tbody>';
  slice.forEach(function(r,i){
    var ri=start+i;
    var kt=(r.kode_transfer||"").toUpperCase();
    var bc="b-mass";
    if(kt.startsWith("IFT"))bc="b-ift";
    else if(kt.startsWith("BIF"))bc="b-bif";
    else if(kt.startsWith("KLR"))bc="b-klr";
    h+='<tr>';
    h+='<td>'+(r.no_urat||"")+'</td>';
    h+='<td>'+(r.ket||"")+'</td>';
    h+='<td>'+(r.kebun||"")+'</td>';
    h+='<td class="num">'+Number(r.nilai||0).toLocaleString("id-ID")+'</td>';
    h+='<td>'+(r.nama_rek||"")+'</td>';
    h+='<td>'+(r.bank||"")+'</td>';
    h+='<td>'+(r.no_rek||"")+'</td>';
    h+='<td><span class="badge '+bc+'">'+(r.kode_transfer||"")+'</span></td>';
    h+='<td>'+(r.jenis_trx||"")+'</td>';
    h+='<td>'+(r.lunas||"")+'</td>';
    h+='<td class="num">'+Number(r.fee||0).toLocaleString("id-ID")+'</td>';
    h+='<td class="num">'+Number(r.jumlah_transfer||0).toLocaleString("id-ID")+'</td>';
    h+='<td><button class="btn btn-v" onclick="viewSlip('+ri+')">View</button></td>';
    h+='</tr>';
  });
  h+='</tbody></table>';
  document.getElementById("table").innerHTML=h;
  document.getElementById("status").textContent=filtered.length+" baris (page "+page+")";
}

function sortBy(col){
  if(sortCol===col)sortAsc=!sortAsc;
  else{sortCol=col;sortAsc=true;}
  var keys=["no_urut","ket","kebun","nilai","nama_rek","bank","no_rek","kode_transfer","jenis_trx","lunas","fee","jumlah_transfer"];
  filtered.sort(function(a,b){
    var va=a[keys[col]]||"",vb=b[keys[col]]||"";
    if(col===0||col===3||col===10||col===11){
      var na=parseFloat(String(va).replace(/[^0-9.-]/g,""))||0;
      var nb=parseFloat(String(vb).replace(/[^0-9.-]/g,""))||0;
      return sortAsc?na-nb:nb-na;
    }
    return sortAsc?String(va).localeCompare(String(vb)):String(vb).localeCompare(String(va));
  });
  page=1;render();renderPager();
}

function renderPager(){
  var pages=Math.ceil(filtered.length/perPage);
  var h="";
  for(var i=1;i<=pages;i++){
    if(i===1||i===pages||Math.abs(i-page)<=2){
      h+='<button onclick="goPage('+i+')" class="'+(i===page?"active":"")+'">'+i+'</button>';
    }
  }
  document.getElementById("pager").innerHTML=h;
}

function goPage(p){page=p;render();renderPager();}

document.getElementById("search").addEventListener("input",function(){
  var q=this.value.toLowerCase();
  filtered=q?rows.filter(function(r){return JSON.stringify(r).toLowerCase().indexOf(q)>=0;}):rows.slice();
  sortCol=0;sortAsc=false;
  filtered.sort(function(a,b){
    var va=parseFloat(String(a.no_urat||0).replace(/[^0-9.-]/g,""))||0;
    var vb=parseFloat(String(b.no_urat||0).replace(/[^0-9.-]/g,""))||0;
    return vb-va;
  });
  page=1;render();renderPager();
});

document.getElementById("dl").onclick=function(){
  var hd=["No Urut","Ket","Kebun","Nilai","Nama Rek","Bank","No Rek","Kode Transfer","Jenis Trx","Lunas","Fee","Jumlah Transfer","Bank Penerima","Sumber"];
  var csv=[hd.join(",")];
  filtered.forEach(function(r){
    var cells=[r.no_urat,r.ket,r.kebun,r.nilai,r.nama_rek,r.bank,r.no_rek,r.kode_transfer,r.jenis_trx,r.lunas,r.fee,r.jumlah_transfer,r.bank_penerima,r.sumber].map(function(v){
      var s=String(v||"");
      return s.indexOf(",")>=0?'"'+s+'"':s;
    });
    csv.push(cells.join(","));
  });
  var blob=new Blob([csv.join(String.fromCharCode(10))],{type:"text/csv"});
  var a=document.createElement("a");
  a.download=SHEET_FILE.replace(".json","")+".csv";
  a.href=URL.createObjectURL(blob);
  a.click();
};

async function viewSlip(idx){
  var r=filtered[idx];
  if(!r)return;
  var slip=document.getElementById("slip");
  slip.innerHTML='<div style="background:linear-gradient(135deg,#1e3a8a,#1e293b);border:1px solid #3b82f6;border-radius:1rem;padding:1.5rem;position:relative">'+
    '<button onclick="document.getElementById('slip').classList.remove('show')" style="position:absolute;top:0.5rem;right:1rem;background:none;border:none;color:#94a3b8;font-size:1.5rem;cursor:pointer">&times;</button>'+
    '<h2 style="color:#fbbf24;text-align:center;margin-bottom:1rem">BUKTI TRANSFER</h2>'+
    '<table style="width:100%;font-size:0.75rem">'+
    '<tr><td style="color:#94a3b8;padding:0.25rem 0">No Urut</td><td style="text-align:right;font-weight:600">'+(r.no_urat||"")+'</td></tr>'+
    '<tr><td style="color:#94a3b8;padding:0.25rem 0">Ket</td><td style="text-align:right;font-weight:600">'+(r.ket||"")+'</td></tr>'+
    '<tr><td style="color:#94a3b8;padding:0.25rem 0">Kebun</td><td style="text-align:right;font-weight:600">'+(r.kebun||"")+'</td></tr>'+
    '<tr><td style="color:#94a3b8;padding:0.25rem 0">Nilai</td><td style="text-align:right;font-weight:600;color:#fbbf24">Rp '+Number(r.nilai||0).toLocaleString("id-ID")+'</td></tr>'+
    '<tr><td style="color:#94a3b8;padding:0.25rem 0">Fee</td><td style="text-align:right;font-weight:600;color:#fbbf24">Rp '+Number(r.fee||0).toLocaleString("id-ID")+'</td></tr>'+
    '<tr><td style="color:#94a3b8;padding:0.25rem 0">Jumlah Transfer</td><td style="text-align:right;font-weight:700;color:#34d399;font-size:0.9rem">Rp '+Number(r.jumlah_transfer||0).toLocaleString("id-ID")+'</td></tr>'+
    '<tr><td style="color:#94a3b8;padding:0.25rem 0">Bank</td><td style="text-align:right;font-weight:600">'+(r.bank||"")+'</td></tr>'+
    '<tr><td style="color:#94a3b8;padding:0.25rem 0">No Rek</td><td style="text-align:right;font-weight:600">'+(r.no_rek||"")+'</td></tr>'+
    '<tr><td style="color:#94a3b8;padding:0.25rem 0">Bank Penerima</td><td style="text-align:right;font-weight:600">'+(r.bank_penerima||"")+'</td></tr>'+
    '<tr><td style="color:#94a3b8;padding:0.25rem 0">Jenis Trx</td><td style="text-align:right;font-weight:600">'+(r.jenis_trx||"")+'</td></tr>'+
    '<tr><td style="color:#94a3b8;padding:0.25rem 0">Lunas</td><td style="text-align:right;font-weight:600">'+(r.lunas||"")+'</td></tr>'+
    '<tr><td style="color:#94a3b8;padding:0.25rem 0">Status</td><td style="text-align:right;font-weight:600;color:#34d399">'+(r.lunas&&r.lunas!=="0"?"SUKSES":"PROSES")+'</td></tr>'+
    '</table>'+
    '<p style="color:#64748b;font-size:0.65rem;text-align:center;margin-top:1rem">Dibuat oleh PRETASE</p>'+
    '</div>';
  slip.classList.add("show");
}

load();
<\/script>
</body></html>`;
  const finalHtml = html.replace("</body>", '<div id="slip"></div></body>');
  return new Response(finalHtml, { headers: { "Content-Type": "text/html" } });
}
__name(sheetPage, "sheetPage");
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/api/login" && request.method === "POST") return handleLogin(request);
    if (path === "/api/logout") return handleLogout();
    if (path === "/login") return loginPage();
    const session = getSession(request);
    if (!session) return new Response(null, { status: 302, headers: { Location: "/login" } });
    if (path === "/") return dashboardPage(session);
    if (path === "/sheet/") return sheetPage(url.searchParams.get("f") || "email_cdp.json");
    return new Response("Not Found", { status: 404 });
  }
};

// ../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-fvsCg1/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = index_default;

// ../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-fvsCg1/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
