describe('FR-32: Validasi Laporan dan Pencairan Dana', () => {
    // Data pencairan berasal dari prisma/seed.ts
    // lib/actions/disbursement.actions.ts — selalu satu baris berstatus "pending"
    // untuk komunitas "Konservasi Laut Bali" senilai Rp 2.000.000.

    before(() => {
        cy.exec('npx prisma db seed');
    });

    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026'); // Admin Utama
        cy.visit('/admin/disbursements');
        cy.contains('h1', /Pencairan Dana/i, { timeout: 10000 }).should('be.visible');
    });
    // ─────────────────────────────────────────────
    // Edge Case 1: Nomor referensi bersifat opsional
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // Edge Case 2: Tandai Gagal (alur negatif)
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // Edge Case 3: Disbursement sudah "completed" - tombol aksi tidak muncul
    // ─────────────────────────────────────────────
    it('FR 32 - Should not show action buttons when disbursement is already completed - TC 04', () => {
        cy.contains('tr', /Selesai/i).first().within(() => {
            cy.contains('button', /Proses|Update Status|Tinjau/i).should('not.exist');
            cy.contains(/Selesai/i).should('be.visible');
        });
    });

    // ─────────────────────────────────────────────
    // New: Menutup modal tanpa memproses
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // New: Tabel pencairan menampilkan kolom dengan benar
    // ─────────────────────────────────────────────
});

// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Validasi Laporan Pertanggungjawaban oleh Admin
// Menutup gap acceptance criteria "Validasi Laporan oleh Admin".
// Data berasal dari prisma/seed.ts
// mengembalikan satu laporan "Laporan Pertanggungjawaban: Bersih Pantai Besar Bunaken" milik
// komunitas "Konservasi Laut Bali" berstatus submitted. approveReportAction &
// rejectReportAction mengembalikan { success: true } di mode E2E.
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Pembuatan Pencairan & Validasi Saldo
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Dana Abadi (Endowment)
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Akses Komunitas ke Data Disbursement
// ════════════════════════════════════════════════════════════════════
