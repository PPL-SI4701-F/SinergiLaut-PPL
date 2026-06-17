describe('FR-12: Kelola Konten Journey (/admin/journey)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });

    it('FR 12 - Harus menampilkan daftar milestone Perjalanan Kami - TC 08', () => {
        cy.visit('/admin/journey');
        cy.contains('Kelola Perjalanan Kami').should('be.visible');
        cy.contains('Tambah Milestone').should('be.visible');
    });
});
