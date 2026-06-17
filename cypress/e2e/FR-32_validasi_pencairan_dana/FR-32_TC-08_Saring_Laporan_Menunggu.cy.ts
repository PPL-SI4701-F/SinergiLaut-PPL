// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Validasi Laporan Pertanggungjawaban oleh Admin
// Menutup gap acceptance criteria "Validasi Laporan oleh Admin".
// Data berasal dari prisma/seed.ts
// mengembalikan satu laporan "Laporan Pertanggungjawaban: Bersih Pantai Besar Bunaken" milik
// komunitas "Konservasi Laut Bali" berstatus submitted. approveReportAction &
// rejectReportAction mengembalikan { success: true } di mode E2E.
// ════════════════════════════════════════════════════════════════════
describe('FR-32: Validasi Laporan oleh Admin (/admin/reports)', () => {
    before(() => {
        cy.exec('npx prisma db seed');
    });

    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026'); // Admin Utama
        cy.visit('/admin/reports');
        cy.get('body', { timeout: 10000 }).should('be.visible');
    });
    it('FR 32 - Harus menyaring laporan menggunakan tab status "Menunggu" - TC 08', () => {
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
