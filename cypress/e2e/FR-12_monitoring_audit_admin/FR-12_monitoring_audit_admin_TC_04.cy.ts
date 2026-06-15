describe('FR-12: Verifikasi Pengguna (/admin/users)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus dapat mengekspansi detail pengguna pending dan melihat opsi', () => {
        cy.contains('button', 'Menunggu').first().click();
        cy.wait(500);
        // Asumsi ada baris/kartu data user dengan badge Menunggu
        cy.get('.border-yellow-300').first().find('button').first().click({ force: true });
        cy.contains('Setujui Verifikasi').should('be.visible');
        cy.contains('Tolak').should('be.visible');
    });
});
