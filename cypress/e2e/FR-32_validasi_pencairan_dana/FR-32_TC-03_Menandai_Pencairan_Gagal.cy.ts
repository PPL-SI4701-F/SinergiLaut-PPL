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
    it('FR 32 - Harus mengizinkan admin menandai pencairan dana sebagai gagal - TC 03', () => {
        // Pindahkan dulu ke status "Diproses"
        cy.contains('tr', 'Menunggu').contains('button', /Tinjau/i).click();
        cy.contains('button', /Setujui & Proses/i).click();
        cy.contains('tr', /Diproses/i).should('be.visible');

        // Tandai sebagai gagal
        cy.contains('tr', /Diproses/i).first().contains('button', /Update Status/i).click();
        cy.contains('button', /Tandai Gagal/i).click();

        cy.contains('Update Status Pencairan').should('not.exist');
        cy.contains('tr', /Gagal/i).should('be.visible');
    });

    // ─────────────────────────────────────────────
    // Edge Case 3: Disbursement sudah "completed" - tombol aksi tidak muncul
    // ─────────────────────────────────────────────
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
