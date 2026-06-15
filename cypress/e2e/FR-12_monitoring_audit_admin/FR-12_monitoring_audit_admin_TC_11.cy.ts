describe('FR-12: Sanksi Komunitas (/admin/communities)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus dapat memunculkan dropdown aksi dan modal Beri Sanksi', () => {
        // Cari tombol titik tiga atau aksi di baris pertama
        cy.get('table').find('button').first().click({ force: true });
        cy.contains('Beri Sanksi').click();

        // Verifikasi modal
        cy.contains('Peringatan').should('be.visible');
        cy.contains('Suspend').should('be.visible');
        cy.contains('Ban Permanen').should('be.visible');
    });
});
