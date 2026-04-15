# 🌊 SinergiLaut — PPL Project

Platform digital untuk koordinasi komunitas konservasi laut, penggalangan dana transparan, dan manajemen relawan di Indonesia.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL via **Supabase** |
| ORM | **Prisma** |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Payment | Midtrans Snap |
| Package Manager | pnpm |

---

## 🚀 Setup dari Awal

### 1. Clone & Install Dependencies

```bash
# Di folder PPL_SinergiLaut ini
pnpm install
```

### 2. Setup Supabase Project

1. Buka [https://supabase.com](https://supabase.com) dan buat akun / login
2. Klik **"New Project"** dan isi:
   - **Name**: `ppl-sinergilaut`
   - **Database Password**: buat password yang kuat (simpan!)
   - **Region**: Southeast Asia (Singapore)
3. Tunggu project selesai dibuat (~1–2 menit)

### 3. Jalankan Schema Database

Buka **Supabase Dashboard → SQL Editor** dan jalankan file berikut secara berurutan:

#### Step 1 — Schema utama
```
Salin isi file: supabase/schema.sql
Paste di SQL Editor → Run
```

#### Step 2 — Row Level Security (RLS)
```
Salin isi file: supabase/rls-policies.sql
Paste di SQL Editor → Run
```

### 4. Setup Supabase Storage

Di Supabase Dashboard → **Storage**, buat bucket baru:

| Bucket Name | Public? | Keterangan |
|------------|---------|-----------|
| `sinergilaut-assets` | ✅ Yes | Gambar cover, logo, banner komunitas |
| `ktp-uploads` | ❌ No | Foto KTP relawan (private) |
| `report-files` | ❌ No | File laporan kegiatan (private) |
| `verification-docs` | ❌ No | Dokumen verifikasi komunitas (private) |

### 5. Konfigurasi Environment Variables

```bash
# Copy template
cp .env.example .env.local
```

Kemudian isi `.env.local` dengan nilai dari Supabase Dashboard:

```bash
# Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Supabase Dashboard → Settings → Database → Connection string
# Pilih "Transaction" mode (port 6543) untuk DATABASE_URL
DATABASE_URL="postgres://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Pilih "Session" mode (port 5432) untuk DIRECT_URL
DIRECT_URL="postgres://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

### 6. Generate Prisma Client & Push Schema

```bash
# Generate Prisma client dari schema
pnpm db:generate

# (Opsional) Push schema Prisma ke database
# Catatan: schema.sql sudah dijalankan via SQL Editor,
# jadi ini hanya untuk mengupdate client
pnpm db:push
```

### 7. Buat Admin Account Pertama

Di Supabase Dashboard → **Authentication → Users**, klik **"Add User"**:
- Email: `admin@sinergilaut.id`
- Password: (buat password)
- Centang `Auto Confirm User`

Kemudian di **SQL Editor**, jalankan:
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@sinergilaut.id';
```

### 8. Menjalankan Aplikasi

Kamu bisa menjalankan aplikasi dengan **Node/pnpm** atau **Docker**.

#### Opsi A: Menggunakan pnpm (Development)
```bash
pnpm dev
```

#### Opsi B: Menggunakan Docker (Production / Standalone Desktop)
Aplikasi ini sudah dipersiapkan menggunakan `Dockerfile` (standalone mode).

1. Build & Run menggunakan Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
2. Cek logs:
   ```bash
   docker-compose logs -f
   ```
3. Berhentikan aplikasi:
   ```bash
   docker-compose down
   ```

Setelah aplikasi berjalan, buka browser dan akses: [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Proyek

```
PPL_SinergiLaut/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── globals.css           # Global styles
│   ├── (auth)/               # Auth pages (login, register)
│   ├── dashboard/            # Community/Admin dashboard
│   ├── activities/           # Activity pages
│   └── api/                  # API Routes
│       └── midtrans/         # Midtrans webhook
├── components/               # Reusable UI components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client
│   │   └── server.ts         # Server Supabase client + Admin client
│   ├── prisma.ts             # Prisma singleton
│   └── actions/              # Server Actions
├── prisma/
│   ├── schema.prisma         # Database schema (Prisma)
│   └── seed.ts               # Database seed script
├── supabase/
│   ├── schema.sql            # ⭐ Database schema SQL (jalankan PERTAMA)
│   └── rls-policies.sql      # ⭐ Row Level Security (jalankan KEDUA)
├── middleware.ts             # Auth middleware
├── tailwind.config.ts        # Tailwind configuration
├── .env.example              # Template environment variables
└── package.json
```

---

## 🗄️ Database Schema

### Tabel Utama

| Tabel | Deskripsi |
|-------|-----------|
| `profiles` | User profiles (extends Supabase auth.users) |
| `communities` | Komunitas konservasi laut |
| `community_verifications` | Data verifikasi komunitas |
| `activities` | Kegiatan konservasi laut |
| `volunteer_registrations` | Pendaftaran relawan |
| `donations` | Donasi uang & barang |
| `donation_items` | Item donasi barang |
| `disbursements` | Pencairan dana ke komunitas |
| `reports` | Laporan pertanggungjawaban kegiatan |
| `report_files` | File lampiran laporan |
| `journey_milestones` | Perjalanan & pencapaian SinergiLaut |
| `sanctions` | Sanksi komunitas |
| `feedbacks` | Ulasan & rating kegiatan |
| `notifications` | Notifikasi pengguna |
| `audit_logs` | Log aktivitas sistem |

### Role Pengguna

| Role | Akses |
|------|-------|
| `admin` | Full access — kelola semua data, verifikasi, disbursement |
| `community` | Kelola kegiatan, relawan, dan laporan komunitas sendiri |
| `user` | Donasi, daftar relawan, lihat kegiatan publik |

---

## 🔑 Scripts Tersedia

```bash
pnpm dev           # Jalankan dev server (localhost:3000)
pnpm build         # Build production
pnpm start         # Jalankan production server
pnpm lint          # Lint code

pnpm db:generate   # Generate Prisma client
pnpm db:push       # Push schema ke database
pnpm db:seed       # Jalankan seed data
pnpm db:studio     # Buka Prisma Studio (GUI database)
pnpm db:reset      # Reset database + seed ulang
```

---

## ⚙️ Konfigurasi Supabase Auth

### Email Templates
Di Supabase Dashboard → **Authentication → Email Templates**, sesuaikan template email untuk:
- Confirm signup
- Reset password
- Magic link

### Auth Settings
Di Supabase Dashboard → **Authentication → Providers**:
- Pastikan **Email** provider aktif
- Nonaktifkan "Confirm email" untuk development (opsional)
- Set **Site URL**: `http://localhost:3000`
- Set **Redirect URLs**: `http://localhost:3000/**`

---

## 💳 Setup Midtrans (Opsional)

1. Daftar di [sandbox.midtrans.com](https://sandbox.midtrans.com)
2. Ambil **Server Key** dan **Client Key** dari Settings → Access Keys
3. Daftarkan Notification URL: `https://yourdomain.com/api/midtrans/webhook`
4. Isi di `.env.local`:
   ```bash
   MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
   MIDTRANS_IS_PRODUCTION=false
   ```

---

## 🐛 Troubleshooting

### Error: `relation "profiles" does not exist`
→ Pastikan sudah menjalankan `supabase/schema.sql` di SQL Editor Supabase.

### Error: `Invalid API key`
→ Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah diisi dengan benar di `.env.local`.

### Error: `P1001: Can't reach database server`
→ Pastikan `DATABASE_URL` dan `DIRECT_URL` di `.env.local` sudah benar (cek password dan project ID).

### Error: `FATAL: (ENOTFOUND) tenant/user... not found` saat `pnpm db:push`
→ Buka Supabase Dashboard > Project Settings > Database > **Reset database password** menggunakan password yang sama. Supavisor connection pooler terkadang mengalami desinkronisasi cache saat environment diperbarui.

### RLS Error: `new row violates row-level security policy`
→ Pastikan sudah menjalankan `supabase/rls-policies.sql` di SQL Editor.

---

## 👥 Tim

Proyek ini dibuat untuk mata kuliah **Pemrograman Perangkat Lunak (PPL)** — Telkom University Semester 6.
