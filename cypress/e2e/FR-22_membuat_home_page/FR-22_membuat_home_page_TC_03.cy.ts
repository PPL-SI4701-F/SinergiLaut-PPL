describe('FR-22: Halaman Beranda (Home Page)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('Harus menampilkan bagian pengantar tentang SinergiLaut dengan tautan ke halaman About', () => {
        cy.visit('/');
        cy.wait(1000);

        cy.contains('Mengenal SinergiLaut Lebih Dekat').should('be.visible');
        cy.contains('a', 'Pelajari Lebih Lanjut').should('have.attr', 'href', '/about');
    });
});
