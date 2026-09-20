# PETA JALAN PRETASE v2 - PROGRESS

## Status: ✅ = Selesai & Teruji | 🔴 = Perlu Perbaikan | ⏳ = Belum

---

### FASE 1: SISTEM AUTHENTICATION ✅

| # | Task | Status |
|---|------|--------|
| 1.1 | Halaman login | ✅ |
| 1.2 | Login API (verifikasi user) | ✅ |
| 1.3 | Session management (5 menit timeout) | ✅ |
| 1.4 | Auto logout jika tidak ada interaksi | ✅ |
| 1.5 | Warning 30 detik sebelum habis | ✅ |
| 1.6 | Logout API | ✅ |

---

### FASE 2: HALAMAN UTAMA (DASHBOARD) ✅

| # | Task | Status |
|---|------|--------|
| 2.1 | Dashboard dengan daftar 8 sheet | ✅ |
| 2.2 | Kartu menu (Upload, Cek Rekening) | ✅ |
| 2.3 | Hak akses berdasarkan role (owner/admin/user) | ✅ |
| 2.4 | Info user & tombol logout | ✅ |

---

### FASE 3: SHEET VIEWER 🔴

| # | Task | Status |
|---|------|--------|
| 3.1 | Tampilan tabel data per sheet | 🔴 Data tidak muncul setelah loading lama |
| 3.2 | Search/filter data | ⏳ |
| 3.3 | Sort by kolom (klik header) | ⏳ |
| 3.4 | Pagination | ⏳ |
| 3.5 | Download CSV (data yang tampil/filter) | ⏳ |
| 3.6 | Tombol View per baris | ⏳ |
| 3.7 | Modal slip transfer | ⏳ |

---

### FASE 4: SLIP TRANSFER 🔴

| # | Task | Status |
|---|------|--------|
| 4.1 | Tampilan slip (pengirim, penerima, jumlah, fee) | ⏳ |
| 4.2 | Data pengirim dari M Rekening | 🔴 Tidak berfungsi |
| 4.3 | Sensor no rek pengirim (4****3) | ⏳ |
| 4.4 | Status: SUKSES/PROSES/isi kolom M | ⏳ |
| 4.5 | Fee: IFT=0, BIF=2500, KLR=2900 | ⏳ |
| 4.6 | Download JPG (html2canvas) | ⏳ |
| 4.7 | Share via Email/WhatsApp | ⏳ |

---

### FASE 5: CEK REKENING ✅

| # | Task | Status |
|---|------|--------|
| 5.1 | Halaman cek rekening | ✅ |
| 5.2 | Pencarian by no rek / nama / bank / code | ✅ |
| 5.3 | Hasil: nama, no rek, bank, code | ✅ |
| 5.4 | Notifikasi "tidak ditemukan" | ✅ |

---

### FASE 6: UPLOAD ✅

| # | Task | Status |
|---|------|--------|
| 6.1 | Halaman upload | ✅ |
| 6.2 | Klik untuk browse file | ✅ |
| 6.3 | Validasi tipe file (.xlsx/.xls) | ✅ |
| 6.4 | Validasi ukuran (maks 10MB) | ✅ |
| 6.5 | Progress bar saat upload | ✅ |
| 6.6 | Upload ke GitHub via API | ✅ |
| 6.7 | Notifikasi sukses/gagal | ✅ |

---

### FASE 7: USER MANAGEMENT ⏳

| # | Task | Status |
|---|------|--------|
| 7.1 | Halaman manajemen user | ⏳ |
| 7.2 | Tambah user baru (username, password, role) | ⏳ |
| 7.3 | Edit/hapus user | ⏳ |
| 7.4 | Set role per user (owner/admin/user) | ⏳ |
| 7.5 | Set akses sheet per user (file terpisah) | ⏳ |
| 7.6 | Reset password user | ⏳ |

---

### FASE 8: PASSWORD & NOTIFIKASI ⏳

| # | Task | Status |
|---|------|--------|
| 8.1 | Password owner reset harian (otomatis) | ⏳ |
| 8.2 | Notifikasi ke bot (Telegram/Discord) | ⏳ |
| 8.3 | Lupa password (admin/user) via link | ⏳ |
| 8.4 | Token reset password (berlaku 15 menit) | ⏳ |

---

### FASE 9: FITUR TAMBAHAN ⏳

| # | Task | Status |
|---|------|--------|
| 9.1 | Halaman profil user | ⏳ |
| 9.2 | Log aktivitas | ⏳ |
| 9.3 | Notifikasi toast (sukses/error/warning) | ⏳ |
| 9.4 | Skeleton screen (loading) | ⏳ |
| 9.5 | Responsive (mobile/tablet/desktop) | ⏳ |

---

### FASE 10: KEAMANAN & OPTIMASI ⏳

| # | Task | Status |
|---|------|--------|
| 10.1 | JWT token | ⏳ |
| 10.2 | HttpOnly cookie | ⏳ |
| 10.3 | Rate limiting | ⏳ |
| 10.4 | Input validation | ⏳ |
| 10.5 | Error handling (retry, fallback) | ⏳ |

---

### FASE 11: GITHUB ACTIONS ⏳

| # | Task | Status |
|---|------|--------|
| 11.1 | Workflow: regenerate JSON saat Excel di-push | ⏳ |
| 11.2 | Token perlu permission `workflow` | ⏳ |

---

## RINGKASAN

| Fase | Nama | Status |
|------|------|--------|
| 1 | Authentication | ✅ |
| 2 | Dashboard | ✅ |
| 3 | Sheet Viewer | 🔴 Data tidak muncul |
| 4 | Slip Transfer | 🔴 M Rekening tidak berfungsi |
| 5 | Cek Rekening | ✅ |
| 6 | Upload | ✅ |
| 7 | User Management | ⏳ |
| 8 | Password & Notifikasi | ⏳ |
| 9 | Fitur Tambahan | ⏳ |
| 10 | Keamanan & Optimasi | ⏳ |
| 11 | GitHub Actions | ⏳ |

---

## MASALAH YANG DITEMUKAN

| # | Masalah | Penyebab | Solusi |
|---|---------|----------|--------|
| 1 | Sheet viewer loading lama, data tidak muncul | CDN timeout atau JSON terlalu besar | Retry mechanism + timeout 5 detik |
| 2 | M Rekening tidak ter-load | API call ke CDN gagal | Tambah error handling + fallback |
| 3 | Modal slip tidak muncul | JS error (showSlip function) | Debug + fix JS |

---

## CATATAN TEKNIS

| Item | Keterangan |
|------|------------|
| Worker | `pretase` (Cloudflare) |
| URL | `https://pretase.rizkyer32013.workers.dev` |
| Data | JSON cache dari GitHub (CDN jsdelivr) |
| Upload | via Worker API → GitHub API |
| Session | Cookie (Base64 encoded, 5 menit timeout) |
| Struktur | Single file `index.js` (all-in-one) |

## USER TEST

| Username | Password | Role |
|----------|----------|------|
| DevPretase | test1234 | Owner |

## PRIORITAS PERBAIKAN

1. **Fase 3** — Fix sheet viewer (data tidak muncul)
2. **Fase 4** — Fix M Rekening loader
3. **Fase 4** — Fix modal slip
