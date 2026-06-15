describe('FR-12: Manajemen Laporan (/admin/reports)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus dapat melakukan pencarian laporan', () => {
        cy.get('input[placeholder*="Cari"]').type('Bersih Pantai');
        cy.wait(500);
    });
});
