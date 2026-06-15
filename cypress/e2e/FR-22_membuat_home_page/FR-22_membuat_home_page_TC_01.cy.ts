describe('FR-22: Halaman Beranda (Home Page)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Harus menampilkan hero section dengan judul dan ajakan utama', () => {
        cy.visit('/');
        cy.wait(1000);

        cy.contains('Bersama Jaga').should('be.visible');
        cy.contains('Laut Indonesia').should('be.visible');
        cy.contains('a', 'Lihat Kegiatan').should('have.attr', 'href', '/activities');
        cy.contains('a', 'Daftar Gratis').should('have.attr', 'href', '/register');
    });
});
