// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Validasi Laporan Pertanggungjawaban oleh Admin
// Menutup gap acceptance criteria "Validasi Laporan oleh Admin".
// Mock getAdminReportsList() di lib/actions/dashboard.actions.ts selalu
// mengembalikan satu laporan "Laporan Pertanggungjawaban: Bersih Pantai Besar Bunaken" milik
// komunitas "Yayasan Laut Bersih Nusantara" berstatus submitted. approveReportAction &
// rejectReportAction mengembalikan { success: true } di mode E2E.
// ════════════════════════════════════════════════════════════════════
describe('FR-32: Validasi Laporan oleh Admin (/admin/reports)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026'); // Admin Utama
    });
    // ─────────────────────────────────────────────
    // AC: approveReportAction → status validated + notifikasi sukses
    // ─────────────────────────────────────────────
    it('Harus memvalidasi laporan submitted dan mengubah status menjadi Divalidasi', () => {
        cy.contains('tr', 'Laporan Pertanggungjawaban: Bersih Pantai Besar Bunaken')
            .contains('button', /Validasi/i).click();

        // Toast konfirmasi notifikasi terkirim ke komunitas
        cy.contains(/berhasil divalidasi/i).should('be.visible');

        // Badge berubah menjadi "Divalidasi"
        cy.contains('tr', 'Laporan Pertanggungjawaban: Bersih Pantai Besar Bunaken')
            .contains(/Divalidasi/i).should('be.visible');

        // Tombol aksi hilang karena status bukan lagi submitted
        cy.contains('tr', 'Laporan Pertanggungjawaban: Bersih Pantai Besar Bunaken')
            .contains('button', /Validasi/i).should('not.exist');
    });

    // ─────────────────────────────────────────────
    // AC: rejectReportAction → status rejected + notifikasi penolakan
    // ─────────────────────────────────────────────
});

// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Pembuatan Pencairan & Validasi Saldo
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Dana Abadi (Endowment)
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Akses Komunitas ke Data Disbursement
// ════════════════════════════════════════════════════════════════════
