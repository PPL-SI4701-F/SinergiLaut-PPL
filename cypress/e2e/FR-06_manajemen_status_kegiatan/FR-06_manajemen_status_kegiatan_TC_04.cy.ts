describe('FR-06: Manajemen status kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role admin.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus mengizinkan admin menolak suatu kegiatan', () => {
        cy.visit('/admin/activities');

        // Find the activity and click Reject (assuming there's a Tolak button)
        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD')
            .parents('.border-blue-200')
            .find('button')
            .contains(/Tolak|Reject/i)
            .click({ force: true });

        // Verify toast or UI update
        cy.contains('Kegiatan ditolak').should('be.visible');
        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD').should('not.exist');
    });
});
