describe('FR-12: Sanksi Komunitas (/admin/communities)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });

    it('Harus menampilkan tabel komunitas dan pencarian', () => {
        cy.contains('Kelola Komunitas').should('be.visible');
        cy.get('input[placeholder*="Cari"]').should('be.visible');
    });
});
