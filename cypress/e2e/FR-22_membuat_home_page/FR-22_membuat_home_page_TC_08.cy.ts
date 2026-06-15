describe('FR-22: Halaman Beranda (Home Page)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('Harus menampilkan tombol Masuk dan Daftar untuk pengunjung yang belum login', () => {
        cy.visit('/');
        cy.wait(1000);

        cy.get('header').within(() => {
            cy.contains('a', 'Masuk').should('have.attr', 'href', '/login');
            cy.contains('a', 'Daftar').should('have.attr', 'href', '/register');
        });
    });
});
