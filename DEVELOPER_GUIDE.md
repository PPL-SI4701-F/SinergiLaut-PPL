# 🗺️ SinergiLaut — Panduan Developer & Peta Kode (Codebase Map)

---

## 🏗️ 1. Konsep Utama & Arsitektur

Proyek ini menggunakan **Next.js 16 (App Router)**. Artinya, struktur folder di dalam `app/` merepresentasikan URL rute di browser.
- File UI (Tampilan) selalu bernama `page.tsx` atau `layout.tsx`.
- Kita menggunakan **Server Actions** (`lib/actions/*.ts`) untuk interaksi ke database, jadi kita jarang membuat file API (`app/api/...`) kecuali untuk Webhook (seperti Midtrans).
- Database kita menggunakan **Supabase (PostgreSQL)**, dan kita menggunakan `prisma` hanya untuk mendefinisikan skema (`prisma/schema.prisma`) dan generate tipe data awal. Namun eksekusi query harian menggunakan `@supabase/ssr` dan `supabase-js`.

---

## 🔑 2. Autentikasi & RBAC (Manajemen Hak Akses)
*(Fitur dari Habibi, Keysha, & Malvin)*

Semua sistem login, register, dan proteksi halaman diatur di sini. Sistem membagi user menjadi 3 role: `admin`, `community`, dan `user`.

| Komponen / Fitur | Lokasi File Kode | Penjelasan |
|------------------|------------------|------------|
| **Halaman Login** | `app/login/page.tsx` | UI form login untuk semua tipe user. |
| **Halaman Register User** | `app/register/page.tsx` | UI pendaftaran untuk relawan/donatur biasa. |
| **Halaman Register Komunitas** | `app/community/register/page.tsx` | UI pendaftaran khusus komunitas (ada upload dokumen & logo). |
| **Logika Auth (Server)** | `lib/actions/auth.actions.ts` | Berisi fungsi `login()`, `register()`, `registerCommunity()`, dan `logout()`. Fungsi ini yang "ngomong" ke Supabase Auth. |
| **Route Guard / Middleware** | `middleware.ts` | **(SANGAT PENTING)** Ini adalah satpam aplikasi kita. File ini mengecek cookie session user setiap kali pindah halaman. Jika user biasa mencoba masuk ke `/admin/...`, middleware akan menendangnya ke `/unauthorized`. |
| **State User Global** | `contexts/auth-context.tsx` | Membungkus seluruh aplikasi dengan context agar kita bisa panggil `useAuth()` di komponen mana saja untuk tahu siapa yang sedang login dan apa role-nya. |

---

## 🏢 3. Dashboard Komunitas
*(Fitur dari Adilio Adaha)*

Tempat komunitas mengelola kegiatan, melihat pendaftar relawan, dan mencatat donasi.

| Komponen / Fitur | Lokasi File Kode | Penjelasan |
|------------------|------------------|------------|
| **Halaman Utama Dashboard** | `app/community/dashboard/page.tsx` | Menampilkan 4 kartu statistik (Total Kegiatan, Relawan, dll) dan list kegiatan komunitas. |
| **Buat Kegiatan Baru** | `app/community/dashboard/activities/create/page.tsx` | Form panjang untuk membuat kegiatan baru (judul, deskripsi, kuota relawan, target donasi). |
| **Edit Kegiatan** | `app/community/dashboard/activities/[id]/edit/page.tsx` | Form untuk mengubah data kegiatan yang sudah ada. |
| **Manajemen Relawan** | `app/community/dashboard/activities/[id]/volunteers/page.tsx` | Tabel yang menampilkan siapa saja yang daftar jadi relawan. Komunitas bisa klik "Terima" (Approve) atau "Tolak" (Reject). |
| **Manajemen Donatur** | `app/community/dashboard/activities/[id]/donors/page.tsx` | Menampilkan riwayat donasi uang dan konfirmasi penerimaan donasi barang. |
| **Logika Data Komunitas** | `lib/actions/dashboard.actions.ts` | Fungsi `getCommunityDashboardStats()` dan `getCommunityActivities()` ada di sini. |
| **Logika Relawan & Donasi**| `lib/actions/volunteer.actions.ts` & `lib/actions/donation.actions.ts` | Fungsi untuk mengambil data pendaftar dan fungsi untuk update status relawan. |

---

## 👨‍💼 4. Dashboard Admin
Tempat super admin mengelola platform secara keseluruhan.

| Komponen / Fitur | Lokasi File Kode | Penjelasan |
|------------------|------------------|------------|
| **Halaman Utama Admin** | `app/admin/dashboard/page.tsx` | Menampilkan statistik makro seluruh platform. |
| **Moderasi Komunitas** | `app/admin/communities/page.tsx` | Admin bisa melihat daftar komunitas yang baru mendaftar dan memverifikasi (Approve) dokumen mereka. |
| **Moderasi Kegiatan** | `app/admin/activities/page.tsx` | Meninjau kegiatan yang dibuat komunitas sebelum bisa tampil di publik. |
| **Daftar User & Journey** | `app/admin/users/page.tsx` & `app/admin/journey/page.tsx` | Melihat daftar relawan/user dan melacak log aktivitas mereka di platform. |

---

## 🌍 5. Halaman Publik & Homepage

Halaman yang bisa diakses oleh siapa saja tanpa perlu login.

| Komponen / Fitur | Lokasi File Kode | Penjelasan |
|------------------|------------------|------------|
| **Homepage Utama** | `app/page.tsx` | Landing page "Bersama Jaga Laut Indonesia". Menampilkan hero banner, info platform, dll. |
| **Katalog Kegiatan** | `app/activities/page.tsx` | Halaman pencarian kegiatan untuk relawan/donatur. |
| **Detail Kegiatan** | `app/activities/[id]/page.tsx` | Halaman utama detail kegiatan. **Catatan:** Kode UI (Tab) untuk halaman ini sudah dipecah dan disimpan di dalam `components/activities/` (misal: `activity-detail-tab.tsx`, `volunteer-management-tab.tsx`) agar lebih rapi. |
| **Dana Abadi (Endowment)** | `app/endowment/page.tsx` | Penjelasan program dana abadi dan cara berkontribusi. |
| **Navbar & Footer** | `components/navigation.tsx` & `components/footer.tsx` | Menu navigasi atas dan footer bawah. |

---

## 💾 6. Database & Konfigurasi Supabase

Bagian krusial yang menghubungkan frontend dengan database Supabase.

| Komponen / Fitur | Lokasi File Kode | Penjelasan |
|------------------|------------------|------------|
| **Skema Database** | `prisma/schema.prisma` | Definisi struktur tabel kita (User, Profile, Activity, Donation, dll). Baca file ini jika bingung kolom apa saja yang ada di tabel. |
| **Tipe Data TypeScript** | `lib/types/index.ts` | Sangat penting! Semua interface TS (seperti `Activity`, `Profile`, `Donation`) didefinisikan di sini agar tidak error saat ngoding. |
| **Client Supabase (Server)** | `lib/supabase/server.ts` | Digunakan DI DALAM `lib/actions/...` atau Server Components. Mengambil data dengan hak akses user (aman). |
| **Client Supabase (Client)** | `lib/supabase/client.ts` | Digunakan DI DALAM `useEffect` atau Client Components (komponen dengan `"use client"`). |
| **Admin Client (Bypass RLS)** | `lib/supabase/server.ts` -> `createAdminClient()` | Dipakai di script atau fungsi khusus yang butuh memaksa update data mengabaikan aturan sekuriti RLS (gunakan dengan hati-hati!). |

---

## 🛠️ 7. UI Components (shadcn/ui) & Utils

Semua komponen visual kecil seperti tombol, form, dan kartu.

| Komponen / Fitur | Lokasi File Kode | Penjelasan |
|------------------|------------------|------------|
| **Komponen UI Dasar** | `components/ui/*.tsx` | Berisi `button.tsx`, `input.tsx`, `card.tsx`, dll. Kita tidak perlu membuat tombol dari awal, tinggal import `<Button>` dari sini. |
| **Komponen Fitur Khusus** | `components/activities/*.tsx` | Komponen pecahan dari halaman yang rumit agar lebih rapi (misalnya *tab* detail kegiatan, *tab* manajemen relawan). |
| **Peta (MapPicker & View)** | `components/map/*.tsx` | Komponen untuk menampilkan peta MapLibre (seperti di halaman detail kegiatan atau saat edit lokasi kegiatan). |
| **Helpers / Utilities** | `lib/utils/helpers.ts` | Fungsi-fungsi pembantu yang sering dipakai, misal: `formatCurrency(10000)` jadi "Rp 10.000", `formatDate()`, dll. |
| **CSS Global & Tailwind** | `app/globals.css` | File konfigurasi CSS dasar dan warna-warna tema platform (misal warna *primary* teal kita didefinisikan di sini). |

---

## 💡 Tips & Trik Kolaborasi

1. **Memanggil Data:** Sebisa mungkin gunakan Server Actions (`lib/actions/*.ts`) daripada membuat file `/api/...` baru. Ini lebih cepat dan aman di Next.js 14+.
2. **"use client":** Jika kamu butuh `useState`, `useEffect`, `onClick`, tambahkan `"use client"` di baris 1 file komponenmu. Jika tidak ada interaktivitas tersebut, jangan tambahkan (biarkan jadi Server Component agar loading lebih cepat).
3. **Membaca Session User:** Jika di Client Component, gunakan `const { user, profile, role } = useAuth()`. Jika di Server Component/Action, gunakan `const supabase = await createClient(); const { data } = await supabase.auth.getUser()`.
4. **Environment Variables (`.env`)**: Jangan pernah memodifikasi `NEXT_PUBLIC_SUPABASE_URL` atau Key secara sembarangan, pastikan nilainya sama dengan yang di `.env.example`.

Semoga panduan ini membantu tim memahami proyek ini dengan cepat! Selamat *coding*! 🚀
