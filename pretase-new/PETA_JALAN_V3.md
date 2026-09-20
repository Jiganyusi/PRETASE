# PETA JALAN PRETASE — 5 WORKER

## Alur

```text
Browser
  ↓
Worker 1: Auth
  - login / register / session
  - upload file Excel

Worker 2: Converter Worker
  - menerima Excel
  - GitHub Action: konversi Excel -> JSON per sheet
  - bukan worker konversi langsung di pemrosesan web utama

Worker 3: Viewer Worker
  - halaman login, dashboard, list per sheet
  - filter berdasarkan nomor urut
  - download hanya data yang ditampilkan / difilter
  - tombol View Slip modal

Worker 4: Data Worker
  - mengembalikan JSON hanya untuk sheet yang diklik user
  - tidak memanggil semua sheet

Worker 5: Cleanup Worker
  - menghapus file Excel asli dari repo
  - hanya menyimpan JSON hasil konversi
```

## Peran Worker

| Worker | Peran |
|---|---|
| 1 Auth | login, register, upload, session |
| 2 Converter | menerima Excel, GitHub Action konversi ke JSON |
| 3 Viewer | list data, filter, download, view slip |
| 4 Data | JSON per sheet sesuai pilihan user |
| 5 Cleanup | hapus Excel asli dari repo |

## Fase Pengerjaan

1. **Fase 1** — Worker 1 Auth
2. **Fase 2** — Worker 3 Viewer dasar
3. **Fase 3** — Worker 4 Data per sheet
4. **Fase 4** — Worker 2 Converter + GitHub Action
5. **Fase 5** — Slip View, download filtered
6. **Fase 6** — integrasi penuh
7. **Fase 7** — Worker 5 Cleanup (paling akhir)

## Catatan Penting

- Kode worker lebih kecil, debug lebih mudah.
- Penambahan fitur baru dilakukan pada worker terkait.
- Data sensitif tidak perlu disimpan berkelanjutan.
- Repository ideally hanya menyimpan JSON hasil konversi, bukan Excel asli.
- Perlu verifikasi: setiap worker saat gagal, tidak membuat web utama error total.
