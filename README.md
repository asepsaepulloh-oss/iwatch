# iWatch — Modern Editorial Anime Streaming Platform

Aplikasi web streaming anime modern, tajam, cepat, elegan, dan siap di-deploy ke Vercel dengan integrasi REST API Samehadaku.

---

## ✨ Fitur Utama

1. **Editorial & Premium UI/UX (Anti-Aislop):**
   - Dominasi latar belakang gelap pekat (`#090a0f`), batas tipis tajam (*subtle borders*), dan aksen warna *Crimson Red* (`#e50914`).
   - Grid poster proporsional, rapi, dan responsif.
   - Tipografi modern bersih (Inter) tanpa elemen *glassmorphism* atau *glow* neon generik yang berlebihan.

2. **Header & Pencarian Cepat (Instant Dropdown):**
   - Logo teks minimalis iWatch.
   - Navigasi utama: Beranda, Katalog Anime, Jadwal Rilis, Top 10, Riwayat Tontonan, dan Koleksi Bookmark.
   - Kotak pencarian instan dengan *debounced querying* dan *dropdown preview* (menampilkan judul, poster, skor, dan tipe).

3. **Beranda Interaktif (Discovery):**
   - Hero spotlight banner menampilkan anime populer mingguan (`/api/top10`) dengan rotasi otomatis dan kontrol manual.
   - Jalur "Lanjutkan Menonton" cepat yang langsung muncul jika pengguna memiliki riwayat tontonan.
   - Bagian "Episode Terbaru Rilis" (`/api/latest?page=1`) dengan format kartu video 16:9 lengkap dengan waktu rilis dan nomor episode.
   - Bagian "Katalog Populer / Rekomendasi".

4. **Katalog & Filter Lengkap:**
   - Filter status (*Ongoing* / *Completed* / *All*).
   - Metode pengurutan (*Popular* / *Latest* / *Title*).
   - Filter navigasi berdasarkan Genre (`/api/genres`).
   - Sistem *pagination* halaman yang mulus.

5. **Jadwal Rilis Harian (Release Schedule):**
   - Tab hari Senin hingga Minggu (`/api/schedule`).
   - Otomatis mendeteksi hari ini (*Today Indicator*).
   - Menampilkan total anime dan jam rilis tiap judul.

6. **Top 10 Mingguan (Leaderboard):**
   - Peringkat visual 1 hingga 10 dengan tipografi nomor besar, poster, dan skor rating.

7. **Detail Anime Lengkap:**
   - Poster vertikal 3:4, judul romaji & kanji, rating bintang, status, total episode, studio, dan sinopsis cerita.
   - Tombol cerdas: "Mulai Nonton Episode 1" atau "Lanjutkan Episode [X]" jika sudah pernah ditonton.
   - Daftar seluruh episode dengan fitur pencarian nomor episode dan pengurutan (Terbaru -> Lama atau Lama -> Terbaru).
   - Fitur bookmark / simpan ke koleksi.

8. **Pemutar Video (Watch / Player Page):**
   - Pemutar iframe responsif 16:9 dari `/api/server/:post/:nume?type=schtml`.
   - Pilihan *Streaming Server* (Server 1 - Blogspot, Server 2 - VIP, Mega, dll).
   - Pemutar cadangan otomatis (*smart fallback streamer*) jika server upstream membatasi iframe lintas domain.
   - Tombol navigasi cepat *Prev Episode* & *Next Episode* serta *shortcut keyboard* (`←`, `→`, `T` untuk Theater Mode).
   - Daftar link unduhan resolusi (360p, 480p, 720p, 1080p, MKV, MP4, x265) dari berbagai server (Gofile, Pixeldrain, Acefile, Mediafire).

9. **Penyimpanan Lokal (LocalStorage):**
   - Otomatis mencatat riwayat tontonan (*Watch History*) dan progres episode terakhir.
   - Halaman khusus riwayat dengan opsi lanjutkan nonton, hapus satu per satu, atau bersihkan seluruh riwayat.

---

## 🚀 Panduan Menjalankan Proyek

### 1. Prasyarat
- Node.js (v18 ke atas disarankan)
- npm atau pnpm

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Server Pengembangan (Dev Server)
```bash
npm run dev
```
Akses aplikasi melalui browser di `http://localhost:3000`.

### 4. Build untuk Produksi
```bash
npm run build
```
Hasil build akan tersimpan di direktori `dist/`.

---

## 🌐 Panduan Deploy ke Vercel

Proyek ini telah dilengkapi dengan berkas konfigurasi `vercel.json` siap pakai untuk Single Page Application (SPA).

### Cara 1: Menggunakan Vercel CLI
```bash
npm install -g vercel
vercel
```

### Cara 2: Melalui Dashboard Vercel (Git Push)
1. Push repositori ini ke GitHub / GitLab.
2. Buka [Vercel Dashboard](https://vercel.com/new).
3. Pilih repositori `iwatch`.
4. Vercel akan otomatis mendeteksi konfigurasi:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Klik **Deploy**. Selesai!

---

## 🛠️ Struktur Direktori Proyek

```
iwatch/
├── dist/                  # Output build produksi siap deploy
├── public/                # Aset statis
├── src/
│   ├── components/        # Komponen UI modular
│   │   ├── AnimeCard.tsx
│   │   ├── EpisodeCard.tsx
│   │   ├── ErrorState.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroBanner.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── Navbar.tsx
│   │   └── Pagination.tsx
│   ├── hooks/             # Custom React Hooks
│   │   └── useStorage.ts  # Hook reaktif LocalStorage
│   ├── pages/             # Halaman-halaman utama
│   │   ├── AnimeDetailPage.tsx
│   │   ├── BookmarksPage.tsx
│   │   ├── CatalogPage.tsx
│   │   ├── HistoryPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── SchedulePage.tsx
│   │   ├── Top10Page.tsx
│   │   └── WatchPage.tsx
│   ├── services/          # Layanan API & Storage
│   │   ├── api.ts         # Helper REST API Samehadaku
│   │   └── history.ts     # Manajemen Watch History & Bookmarks
│   ├── types/             # TypeScript Type Definitions
│   │   └── anime.ts
│   ├── App.tsx            # Definisi Routing React Router
│   ├── index.css          # Desain sistem Tailwind & variabel
│   └── main.tsx           # Titik masuk aplikasi React
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vercel.json            # Konfigurasi Vercel SPA routing
└── vite.config.ts
```

