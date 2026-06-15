describe('FR-18: Autentikasi & Pendaftaran Akun Komunitas', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Harus menampilkan halaman pendaftaran komunitas dengan stepper 4 langkah', () => {
        cy.visit('/community/register');
        cy.wait(1000);

        cy.contains('h1', 'Bergabung dengan SinergiLaut sebagai Komunitas Konservasi').should('be.visible');
        cy.contains('Informasi Komunitas').should('be.visible');
        cy.contains('Step 1 of 4').should('exist');
    });
});
