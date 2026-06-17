const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-32_validasi_pencairan_dana';
const files = fs.readdirSync(dir);

const mapping = {
  'FR 32 - TC 01 - Harus mengizinkan admin memproses pencairan dana dari Menunggu hingga Selesai.cy.ts': 'FR-32_TC-01_Memproses_Pencairan_Menunggu_Selesai.cy.ts',
  'FR 32 - TC 02 - Harus tetap berhasil memproses pencairan walau nomor referensi dikosongkan.cy.ts': 'FR-32_TC-02_Memproses_Pencairan_Tanpa_Referensi.cy.ts',
  'FR 32 - TC 03 - Harus mengizinkan admin menandai pencairan dana sebagai gagal.cy.ts': 'FR-32_TC-03_Menandai_Pencairan_Gagal.cy.ts',
  'FR 32 - TC 04 - Should not show action buttons when disbursement is already completed.cy.ts': 'FR-32_TC-04_Sembunyi_Aksi_Pencairan_Selesai.cy.ts',
  'FR 32 - TC 05 - Harus menutup modal update status saat tombol Batal atau Close diklik.cy.ts': 'FR-32_TC-05_Tutup_Modal_Batal.cy.ts',
  'FR 32 - TC 06 - Harus menampilkan kolom tabel pencairan yang mencakup komunitas, jumlah, dan status.cy.ts': 'FR-32_TC-06_Kolom_Tabel_Lengkap.cy.ts',
  'FR 32 - TC 07 - Harus menampilkan laporan submitted dengan badge Menunggu Review dan tombol aksi.cy.ts': 'FR-32_TC-07_Laporan_Menunggu_Review_Aksi.cy.ts',
  'FR 32 - TC 08 - Harus menyaring laporan menggunakan tab status \'Menunggu\'.cy.ts': 'FR-32_TC-08_Saring_Laporan_Menunggu.cy.ts',
  'FR 32 - TC 09 - Harus memvalidasi laporan submitted dan mengubah status menjadi Divalidasi.cy.ts': 'FR-32_TC-09_Validasi_Laporan.cy.ts',
  'FR 32 - TC 10 - Harus menolak laporan submitted dan mengubah status menjadi Ditolak.cy.ts': 'FR-32_TC-10_Tolak_Laporan.cy.ts',
  'FR 32 - TC 11 - Harus memiliki tautan Lihat Detail yang benar.cy.ts': 'FR-32_TC-11_Tautan_Lihat_Detail_Benar.cy.ts',
  'FR 32 - TC 12 - Harus berhasil membuat pencairan baru jika saldo mencukupi.cy.ts': 'FR-32_TC-12_Buat_Pencairan_Baru.cy.ts',
  'FR 32 - TC 13 - Harus gagal dan menampilkan error jika nominal pencairan melebihi saldo tersedia.cy.ts': 'FR-32_TC-13_Gagal_Pencairan_Saldo_Kurang.cy.ts',
  'FR 32 - TC 14 - Harus menampilkan list pencairan dana abadi di halaman publik endowment.cy.ts': 'FR-32_TC-14_List_Pencairan_Dana_Abadi.cy.ts',
  'FR 32 - TC 15 - Komunitas hanya melihat riwayat pencairan miliknya sendiri.cy.ts': 'FR-32_TC-15_Komunitas_Riwayat_Sendiri.cy.ts'
};

for (const file of files) {
  if (mapping[file]) {
    fs.renameSync(path.join(dir, file), path.join(dir, mapping[file]));
    console.log(`Renamed ${file} to ${mapping[file]}`);
  }
}
