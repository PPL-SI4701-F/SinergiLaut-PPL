// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Validasi Laporan Pertanggungjawaban oleh Admin
// Menutup gap acceptance criteria "Validasi Laporan oleh Admin".
// Mock getAdminReportsList() di lib/actions/dashboard.actions.ts selalu
// mengembalikan satu laporan "Laporan Pertanggungjawaban: Bersih Pantai Besar Bunaken" milik
// komunitas "Yayasan Laut Bersih Nusantara" berstatus submitted. approveReportAction &
// rejectReportAction mengembalikan { success: true } di mode E2E.
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Pembuatan Pencairan & Validasi Saldo
// ════════════════════════════════════════════════════════════════════
describe('FR-32: Pembuatan Pencairan dan Validasi Saldo', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026'); // Admin Utama
    });
    it('Harus gagal dan menampilkan error jika nominal pencairan melebihi saldo tersedia', () => {
        cy.visit('/admin/disbursements');
        cy.get('body').should('not.have.css', 'pointer-events', 'none'); // Tunggu body tidak ter-lock
        cy.contains('button', /Buat Pencairan/i).click({ force: true });

        // Pilih kegiatan pertama yang tersedia
        cy.get('select').find('option').eq(1).then($option => {
            cy.get('select').select($option.val() as string);
        });

        // Test case melebihi saldo
        cy.get('input[name="amount"]').type('1000000000'); // Asumsi jauh lebih besar dari saldo
        cy.get('input[name="bank_name"]').type('BCA');
        cy.get('input[name="account_number"]').type('123456789');
        cy.get('input[name="account_name"]').type('Komunitas Laut');
        cy.get('[role="dialog"]').contains('button', /Simpan|Buat/i).click({ force: true });

        // Alert error dari server action
        cy.contains(/melebihi saldo tersedia/i).should('exist');
    });
});

// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Dana Abadi (Endowment)
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Akses Komunitas ke Data Disbursement
// ════════════════════════════════════════════════════════════════════
