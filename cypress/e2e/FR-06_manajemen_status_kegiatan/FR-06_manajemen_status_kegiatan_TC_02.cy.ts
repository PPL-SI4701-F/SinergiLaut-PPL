describe('FR-06: Manajemen status kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role admin.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus mengizinkan admin meninjau detail kegiatan yang menunggu persetujuan', () => {
        cy.visit('/admin/activities');
        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD')
            .parents('.border-blue-200')
            .find('a')
            .contains(/Review/i)
            .click({ force: true });

        // Assert redirect and correct content loads from the mock
        cy.url().should('include', '/admin/activities/activity-1/review');
        cy.contains('Review Kegiatan').should('be.visible');
        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD').should('be.visible');
    });
});
