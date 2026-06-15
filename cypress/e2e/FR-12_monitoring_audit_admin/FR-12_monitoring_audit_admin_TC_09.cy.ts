describe('FR-12: Kelola Konten Journey (/admin/journey)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus dapat membuka form Tambah Milestone', () => {
        cy.contains('Tambah Milestone').click();
        // Cek field form
        cy.contains('Tahun').should('be.visible');
        cy.contains('Judul').should('be.visible');
        cy.contains('Deskripsi').should('be.visible');
    });
});
