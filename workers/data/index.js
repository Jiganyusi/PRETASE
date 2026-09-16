// PRETASE Worker 4 - Data
// Mengembalikan JSON hanya untuk satu sheet yang dipilih user

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/Jiganyusi/PRETASE@main/worker/sheets/';

// Whitelist file JSON yang boleh diakses
const ALLOWED_FILES = [
  'email-cdp.json',
  'rekrut.json',
  'bapp.json',
  'cola.json',
  'cs.json',
  'kontanan.json',
  'perdin-ro.json',
  'lain-lain.json',
  'm-rekening.json',
];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Hanya terima request dari Worker Main (router)
    // Validasi origin atau header khusus bisa ditambahkan di sini

    if (path.startsWith('/api/sheet/')) {
      const fileName = path.replace('/api/sheet/', '');

      // Validasi file whitelist
      if (!ALLOWED_FILES.includes(fileName)) {
        return new Response(JSON.stringify({ error: 'File not allowed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const cdnUrl = CDN_BASE + fileName;
        const response = await fetch(cdnUrl);

        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'CDN error: ' + response.status }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300', // Cache 5 menit
          },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};