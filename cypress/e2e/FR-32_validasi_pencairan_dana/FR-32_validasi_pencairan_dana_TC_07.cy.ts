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

    it('Harus menampilkan laporan submitted dengan badge Menunggu Review dan tombol aksi', () => {
        cy.contains('tr', 'Laporan Pertanggungjawaban: Bersih Pantai Besar Bunaken').within(() => {
            cy.contains('Yayasan Laut Bersih Nusantara').should('be.visible');
            cy.contains(/Menunggu Review/i).should('be.visible');
            cy.contains('button', /Validasi/i).should('be.visible');
            cy.contains('button', /Tolak/i).should('be.visible');
        });
    });
    // ─────────────────────────────────────────────
    // AC: approveReportAction → status validated + notifikasi sukses
    // ─────────────────────────────────────────────
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
