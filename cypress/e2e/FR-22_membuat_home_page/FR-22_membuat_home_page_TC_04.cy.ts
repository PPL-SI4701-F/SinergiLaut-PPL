describe('FR-22: Halaman Beranda (Home Page)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('Harus menampilkan tiga pilar nilai utama platform', () => {
        cy.visit('/');
        cy.wait(1000);

        cy.contains('Dibangun di Atas Tiga Prinsip').should('be.visible');
        cy.contains('100% Transparan').should('be.visible');
        cy.contains('Komunitas Lokal').should('be.visible');
        cy.contains('Dampak Nyata').should('be.visible');
    });
});
