describe('FR-22: Halaman Beranda (Home Page)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('Harus menampilkan statistik platform pada hero section', () => {
        cy.visit('/');
        cy.wait(1000);

        cy.contains('Relawan Aktif').should('be.visible');
        cy.contains('Kegiatan Berlangsung').should('be.visible');
        cy.contains('Jumlah Komunitas').should('be.visible');
    });
});
