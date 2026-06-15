describe('FR-12: Manajemen Laporan (/admin/reports)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });

    it('Harus menampilkan tabel laporan dengan kolom yang sesuai', () => {
        cy.contains('th', 'Laporan').should('be.visible');
        cy.contains('th', 'Komunitas').should('be.visible');
        cy.contains('th', 'Tanggal').should('be.visible');
        cy.contains('th', 'Status').should('be.visible');
        cy.contains('th', 'Aksi').should('be.visible');
    });
});
