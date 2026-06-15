describe('FR-22: Halaman Beranda (Home Page)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('Harus menampilkan navigasi utama dengan tautan Kegiatan, Komunitas, dan Tentang', () => {
        cy.visit('/');
        cy.wait(1000);

        cy.get('header').within(() => {
            cy.contains('a', 'Kegiatan').should('have.attr', 'href', '/activities');
            cy.contains('a', 'Komunitas').should('have.attr', 'href', '/community');
            cy.contains('a', 'Tentang').should('have.attr', 'href', '/about');
        });
    });
});
