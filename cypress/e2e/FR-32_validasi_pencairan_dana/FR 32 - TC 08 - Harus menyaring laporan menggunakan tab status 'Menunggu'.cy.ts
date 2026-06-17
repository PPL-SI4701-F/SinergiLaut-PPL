// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Validasi Laporan Pertanggungjawaban oleh Admin
// Menutup gap acceptance criteria "Validasi Laporan oleh Admin".
// Mock getAdminReportsList() di lib/actions/dashboard.actions.ts selalu
// mengembalikan satu laporan "Laporan Pertanggungjawaban: Bersih Pantai Besar Bunaken" milik
// komunitas "Gerakan Pesisir Hijau Lombok" berstatus submitted. approveReportAction &
// rejectReportAction mengembalikan { success: true } di mode E2E.
// ════════════════════════════════════════════════════════════════════
describe('FR-32: Validasi Laporan oleh Admin (/admin/reports)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026'); // Admin Utama
        cy.visit('/admin/reports');
        cy.wait(1000);
    });
    it('FR 32 - TC 08 - Harus menyaring laporan menggunakan tab status "Menunggu"', () => {
        cy.contains('button', /^\s*Menunggu/i).click();
        cy.contains('tbody tr', /Menunggu Review/i).should('have.length.at.least', 1);
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
