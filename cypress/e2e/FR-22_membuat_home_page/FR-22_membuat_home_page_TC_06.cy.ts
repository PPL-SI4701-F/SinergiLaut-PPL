describe('FR-22: Halaman Beranda (Home Page)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('Harus menampilkan ajakan untuk bergabung pada bagian penutup', () => {
        cy.visit('/');
        cy.wait(1000);

        cy.contains('Bergabung Sekarang').should('be.visible');
        cy.contains('100% Transparan').should('be.visible');
        cy.contains('Komunitas Terverifikasi').should('be.visible');
        cy.contains('Dampak Nyata').should('be.visible');
        cy.contains('Gratis Bergabung').should('be.visible');
    });
});
