# 🌊 SinergiLaut

**Platform Konservasi Laut Indonesia** — Menghubungkan komunitas, relawan, dan donatur untuk menjaga ekosistem laut Nusantara.

> Proyek Pengembangan Perangkat Lunak (PPL) — SI4701 — Telkom University

---

## 📋 Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Fitur Utama](#fitur-utama)
- [Struktur Folder](#struktur-folder)
- [Getting Started](#getting-started)
- [Akun Seed (Testing)](#akun-seed-testing)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Tim Pengembang](#tim-pengembang)

---

## Tentang Proyek

SinergiLaut adalah platform web yang memfasilitasi kolaborasi antara komunitas konservasi laut, relawan, dan donatur. Platform ini menyediakan fitur manajemen kegiatan konservasi, pendaftaran relawan, donasi (uang & barang), pelaporan kegiatan, serta dashboard analitik untuk setiap peran pengguna.

### Peran Pengguna (RBAC)

| Role | Akses |
|------|-------|
| **Admin** | Dashboard admin, moderasi komunitas & kegiatan, validasi laporan, manajemen pengguna |
| **Community** | Dashboard komunitas, CRUD kegiatan, manajemen relawan & donatur, upload laporan |
| **User** | Dashboard user, daftar relawan, donasi, riwayat aktivitas |

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI + CVA) |
| **Database** | PostgreSQL (via [Supabase](https://supabase.com/)) |
| **ORM** | [Prisma](https://www.prisma.io/) (schema management) |
| **Auth** | Supabase Auth + `@supabase/ssr` |
| **Storage** | Supabase Storage |
| **Payment** | [Midtrans](https://midtrans.com/) (Snap) |
| **Maps** | [MapLibre GL](https://maplibre.org/) + MapTiler |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Package Manager** | pnpm |
| **Deployment** | Docker / Vercel |

---

## Arsitektur

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│  React Components + Auth Context + Supabase Client   │
├─────────────────────────────────────────────────────┤
│                 Next.js App Router                    │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Pages    │  │ Server       │  │ API Routes    │  │
│  │  (RSC +   │  │ Actions      │  │ /api/midtrans │  │
│  │  Client)  │  │ (lib/actions)│  │               │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────┤
│                    Middleware                         │
│         Session Refresh + RBAC Route Guard           │
├─────────────────────────────────────────────────────┤
│                  Supabase (BaaS)                     │
│  ┌────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐  │
│  │  Auth   │  │Database │  │ Storage │  │  RLS   │  │
│  │(JWT+SSR)│  │(Postgres)│  │ (Files) │  │Policies│  │
│  └────────┘  └─────────┘  └─────────┘  └────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Fitur Utama

### 🏠 Halaman Publik
- **Homepage** — Landing page dengan statistik platform
- **Kegiatan** — Katalog kegiatan konservasi (filter, search, detail)
- **Dana Abadi (Endowment)** — Informasi program dana abadi
- **Tentang** — Informasi tentang SinergiLaut
- **FAQ** — Pertanyaan yang sering ditanya
- **Kontak** — Formulir kontak

### 🔐 Autentikasi
- Login / Register (user biasa & komunitas)
- Forgot password
- Session management via Supabase SSR
- Middleware RBAC (route protection per role)

### 👨‍💼 Dashboard Admin (`/admin`)
- Statistik platform (komunitas, pengguna, kegiatan, endowment)
- Moderasi komunitas (approve/reject)
- Moderasi kegiatan (approve/reject)
- Validasi laporan kegiatan
- Manajemen pengguna
- Perjalanan pengguna (journey tracking)

### 🏢 Dashboard Komunitas (`/community/dashboard`)
- Statistik komunitas (kegiatan, relawan, donasi, laporan)
- CRUD kegiatan konservasi
- Manajemen relawan (approve/reject/hadir)
- Manajemen donatur (uang via Midtrans + barang)
- Edit kegiatan (deskripsi, lokasi, peta, thumbnail)

### 👤 Dashboard User (`/user/dashboard`)
- Statistik pribadi (kegiatan diikuti, donasi)
- Riwayat pendaftaran relawan
- Riwayat donasi
- Profil & verifikasi volunteer (KTP)

### 💰 Donasi
- Donasi uang via Midtrans Snap (VA, e-wallet, kartu kredit)
- Donasi barang (multi-item, tracking pengiriman)
- Konfirmasi penerimaan barang oleh komunitas

### 📍 Peta Interaktif
- Pin lokasi kegiatan via MapLibre GL
- Geocoding lokasi
- Map picker untuk input koordinat

---

## Struktur Folder

```
PPL_SinergiLaut/
├── app/                          # Next.js App Router
│   ├── about/                    # Halaman Tentang
│   ├── activities/               # Katalog & Detail Kegiatan
│   ├── admin/                    # Dashboard Admin
│   │   ├── activities/           #   Moderasi kegiatan
│   │   ├── communities/          #   Moderasi komunitas
│   │   ├── dashboard/            #   Dashboard utama admin
│   │   ├── journey/              #   Journey tracking
│   │   ├── reports/              #   Validasi laporan
│   │   └── users/                #   Manajemen pengguna
│   ├── api/                      # API Routes
│   │   └── midtrans/             #   Webhook & create transaction
│   ├── auth/                     # Auth callback
│   ├── community/                # Dashboard Komunitas
│   │   ├── dashboard/            #   Dashboard utama
│   │   │   └── activities/       #   CRUD kegiatan
│   │   │       ├── create/       #     Buat kegiatan baru
│   │   │       └── [id]/         #     Detail kegiatan
│   │   │           ├── donors/   #       Manajemen donatur
│   │   │           ├── edit/     #       Edit kegiatan
│   │   │           └── volunteers/ #     Manajemen relawan
│   │   └── register/             #   Registrasi komunitas
│   ├── contact/                  # Halaman Kontak
│   ├── endowment/                # Dana Abadi
│   ├── faq/                      # FAQ
│   ├── forgot-password/          # Lupa Password
│   ├── login/                    # Halaman Login
│   ├── register/                 # Halaman Register
│   ├── unauthorized/             # Halaman 403
│   └── user/                     # Dashboard User
│       ├── dashboard/            #   Dashboard utama user
│       └── profile/              #   Profil & verifikasi
├── components/                   # React Components
│   ├── map/                      #   MapPicker & MapView
│   ├── ui/                       #   shadcn/ui components (57 file)
│   ├── footer.tsx                #   Footer
│   └── navigation.tsx            #   Navbar
├── contexts/                     # React Context
│   └── auth-context.tsx          #   Auth provider (user, profile, role)
├── lib/                          # Libraries & Utilities
│   ├── actions/                  #   Server Actions
│   │   ├── auth.actions.ts       #     Login, register, logout
│   │   ├── dashboard.actions.ts  #     Stats & data (admin/community/user)
│   │   ├── disbursement.actions.ts #   Pencairan dana
│   │   ├── donation.actions.ts   #     CRUD donasi (uang & barang)
│   │   ├── endowment.actions.ts  #     Dana abadi
│   │   ├── feedback.actions.ts   #     Feedback kegiatan
│   │   ├── journey.actions.ts    #     Journey tracking
│   │   ├── notification.actions.ts #   Notifikasi
│   │   ├── volunteer.actions.ts  #     CRUD pendaftaran relawan
│   │   └── volunteer-verification.actions.ts # Verifikasi volunteer
│   ├── supabase/                 #   Supabase clients (server & browser)
│   ├── types/                    #   TypeScript type definitions
│   ├── utils/                    #   Helper functions
│   └── constants.ts              #   App constants
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             #   Database schema
│   └── seed.ts                   #   Prisma seed script
├── public/                       # Static assets
├── scripts/                      # Utility scripts
│   ├── seed-admin.mjs            #   Seed akun admin
│   └── seed-community.mjs        #   Seed akun komunitas
├── styles/                       # Global styles
├── middleware.ts                  # Auth + RBAC middleware
├── Dockerfile                    # Docker production build
├── docker-compose.yml            # Docker Compose config
└── package.json                  # Dependencies & scripts
```

---

## Getting Started

### Prasyarat

- **Node.js** >= 20
- **pnpm** >= 9
- Akun [Supabase](https://supabase.com/) (database + auth + storage)
- (Opsional) Akun [Midtrans Sandbox](https://dashboard.sandbox.midtrans.com/) untuk donasi
- (Opsional) API key [MapTiler](https://www.maptiler.com/) untuk peta

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/<org>/PPL_SinergiLaut.git
cd PPL_SinergiLaut

# 2. Install dependencies
pnpm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env dan isi dengan credentials Supabase, Midtrans, dll.

# 4. Generate Prisma client
pnpm db:generate

# 5. Push schema ke database (jika pertama kali)
pnpm db:push

# 6. Seed akun testing (opsional)
node scripts/seed-admin.mjs
node scripts/seed-community.mjs

# 7. Jalankan development server
pnpm dev
```

Aplikasi berjalan di **http://localhost:3000**

### NPM Scripts

| Command | Deskripsi |
|---------|-----------|
| `pnpm dev` | Jalankan dev server (Turbopack) |
| `pnpm build` | Build production |
| `pnpm start` | Jalankan production server |
| `pnpm lint` | Jalankan ESLint |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema ke database |
| `pnpm db:studio` | Buka Prisma Studio (GUI database) |
| `pnpm db:reset` | Reset database + seed |

---

## Akun Seed (Testing)

Jalankan seed scripts untuk membuat akun testing:

```bash
# Akun Admin
node scripts/seed-admin.mjs
# 📧 admin@sinergilaut.com
# 🔑 Admin1234!

# Akun Komunitas (terverifikasi, dengan 2 kegiatan sample)
node scripts/seed-community.mjs
# 📧 komunitas.test@sinergilaut.com
# 🔑 Test1234!
```

---

## Environment Variables

Salin `.env.example` ke `.env` dan isi:

| Variable | Deskripsi | Required |
|----------|-----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) | ✅ |
| `DATABASE_URL` | PostgreSQL connection (pooler) | ✅ |
| `DIRECT_URL` | PostgreSQL connection (direct, untuk migration) | ✅ |
| `NEXT_PUBLIC_BASE_URL` | Base URL aplikasi | ✅ |
| `MIDTRANS_SERVER_KEY` | Midtrans server key | ⚠️ |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Midtrans client key | ⚠️ |
| `NEXT_PUBLIC_MAPTILER_KEY` | MapTiler API key | ⚠️ |

> ⚠️ = Diperlukan untuk fitur tertentu (donasi / peta)

---

## Deployment

### Docker

```bash
# Build image
docker build -t sinergilaut .

# Atau gunakan Docker Compose
docker-compose up -d
```

### Vercel

1. Connect repository ke Vercel
2. Set environment variables di Vercel dashboard
3. Deploy otomatis pada setiap push ke branch `main`

---

## Tim Pengembang

| Nama | Peran | NIM |
|------|-------|-----|
| Adilio Adaha | Dashboard Komunitas | - |
| Habibi Budiman | Homepage & Autentikasi Login | - |
| Keysha Aulia | Autentikasi & Login Komunitas | - |
| Malvin | Manajemen Hak Akses (RBAC) | - |

**Mata Kuliah:** Pengembangan Perangkat Lunak (PPL) — SI4701  
**Universitas:** Telkom University  
**Semester:** 6 (Genap 2025/2026)

---

## Lisensi

Proyek ini dikembangkan untuk keperluan akademis mata kuliah PPL di Telkom University.
