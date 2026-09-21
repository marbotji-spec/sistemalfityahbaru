# Sistem Manajemen Yayasan Pendidikan Al-Qur'an

Fondasi aplikasi full-stack untuk pengelolaan santri, guru, program TPA,
Tahfiz, pembelajaran, capaian, absensi, pembayaran, dan laporan yayasan.

## Fase 1: Setup

Teknologi yang digunakan:

- Next.js 16 dengan App Router
- TypeScript
- Tailwind CSS v4
- Supabase SSR dan Supabase JavaScript client
- PostgreSQL melalui Supabase
- Git, siap dipublikasikan ke GitHub
- Siap dideploy ke Vercel

## Menjalankan lokal

Salin `.env.example` menjadi `.env.local`, isi environment variable Supabase,
lalu jalankan:

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

Validasi production:

```bash
npm run lint
npm run build
```

## Supabase

1. Buat project baru di https://supabase.com/dashboard.
2. Buka **Project Settings > API**.
3. Salin **Project URL** ke `NEXT_PUBLIC_SUPABASE_URL`.
4. Salin **Publishable key / anon key** ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Simpan secret server-only hanya di environment Vercel atau `.env.local`.

Migration database akan ditambahkan pada fase berikutnya di
`supabase/migrations/`.

## Deployment

Hubungkan repository GitHub ke Vercel, lalu tambahkan environment variable yang
sama pada pengaturan project Vercel. Jangan commit `.env.local` atau secret
Supabase.

## Struktur awal

```text
src/
	app/                 # App Router dan route aplikasi
	components/          # Komponen UI reusable
	lib/
		supabase/          # Client Supabase browser dan server
supabase/
	migrations/          # Migration PostgreSQL yang dapat dilacak
```
