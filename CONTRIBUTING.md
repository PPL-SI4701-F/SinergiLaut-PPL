# 🤝 Panduan Kontribusi SinergiLaut

Terima kasih telah berkontribusi di **SinergiLaut**! Untuk menjaga kualitas kode dan keteraturan project, harap ikuti aturan main berikut.

## 🌿 1. Aturan Branching (Git)

Jangan pernah melakukan commit langsung ke branch `main`. Semua fitur baru atau perbaikan bug harus melalui branch terpisah.

### Penamaan Branch:
Gunakan format berikut: `[tipe]/[ID-Jira]-[deskripsi-singkat]`

- **Feature:** `feat/FR-01-login-system`
- **Bug Fix:** `fix/FR-05-broken-button`
- **Refactoring:** `refactor/clean-up-auth-logic`
- **Dokumentasi:** `docs/update-readme`

---

## 🛰️ 2. Workflow Pengembangan

1. **Update Local:** Pastikan branch `main` kamu adalah yang terbaru.
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Buat Branch:**
   ```bash
   git checkout -b feat/FR-XX-nama-fitur
   ```
3. **Commit Secara Teratur:** Gunakan pesan commit yang deskriptif dan sertakan ID Jira.
   ```bash
   git commit -m "feat(FR-XX): implementasi dashboard statistik"
   ```
4. **Push & Pull Request:**
   ```bash
   git push origin feat/FR-XX-nama-fitur
   ```
   Buka PR di GitHub/GitLab dan tag minimal **1 reviewer**.

---

## 🎫 3. Integrasi Jira (Smart Commits)

Kita menggunakan **Smart Commits** untuk menghubungkan Git dengan Jira. Pastikan ID Ticket Jira ada di setiap pesan commit.

| Perintah | Contoh Pesan Commit | Hasil di Jira |
| :--- | :--- | :--- |
| **Link** | `fix(FR-12): perbaiki typo di footer` | Commit muncul di tab 'Development' ticket FR-12. |
| **Status** | `feat(FR-07): #in-progress buat UI pencarian` | Memindahkan ticket FR-07 ke kolom 'In Progress'. |
| **Done** | `feat(FR-07): #done integrasi api pencarian` | Memindahkan ticket ke kolom 'Done'. |
| **Comment** | `fix(FR-24): #comment perlu cek ulang policy RLS` | Menambahkan komentar ke dalam ticket. |

---

## 🛠️ 4. Standar Kode & Kualitas

- **Linting:** Jalankan `pnpm lint` sebelum push.
- **Tipe Data:** Selalu gunakan TypeScript dan definisikan interface di `lib/types/index.ts`.
- **Server Actions:** Utamakan penggunaan Server Actions di `lib/actions/` untuk operasi database.

---

Semangat berkontribusi! 🚀
