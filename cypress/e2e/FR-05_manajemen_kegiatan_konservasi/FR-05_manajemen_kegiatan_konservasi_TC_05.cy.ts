describe('FR-05: Manajemen kegiatan konservasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role community.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('owner1@example.com', 'Password@2026');
    });
    it('Harus menampilkan tombol Edit yang mengarah ke halaman edit untuk kegiatan berstatus Draft', () => {
        cy.visit('/community/dashboard');
        cy.wait(1000);

        cy.contains('Rencana Bersih Pantai Sanur').parents('.border-border').within(() => {
            cy.contains('a', 'Edit')
                .should('have.attr', 'href')
                .and('include', '/edit');
        });
    });
});
