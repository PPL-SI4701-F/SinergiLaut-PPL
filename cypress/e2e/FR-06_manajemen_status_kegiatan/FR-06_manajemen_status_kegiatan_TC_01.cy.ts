describe('FR-06: Manajemen status kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.setCookie('e2e-bypass-auth', 'admin');

        // Intercepts for activities are no longer needed here since Server Actions 
        // natively return the E2E mock data using getE2EMock().

        // Intercept volunteer registrations to avoid database errors on the activity detail page
        cy.intercept('GET', '**/rest/v1/volunteer_registrations*', {
            statusCode: 200,
            body: []
        }).as('getVolunteerRegistrations');
    });

    it('Harus memuat dan menampilkan daftar kegiatan menunggu persetujuan dan berlangsung', () => {
        cy.visit('/admin/activities');
        cy.contains('Kelola Kegiatan').should('be.visible');
        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD').should('be.visible');
        cy.contains('Pemantauan Terumbu Karang Amed').should('be.visible');
        cy.contains('Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').should('be.visible');
    });
});
