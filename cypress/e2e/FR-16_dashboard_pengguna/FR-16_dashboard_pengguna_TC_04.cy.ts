describe('FR-16: Dashboard Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved1@user.com', 'Password@2026'); // Dian Rahmawati
    });
    it('Harus mengarahkan ke halaman profil saat tautan Edit Profil diklik', () => {
        cy.visit('/user/dashboard');
        cy.wait(1000);

        cy.contains('a', 'Edit Profil').click();
        cy.url().should('include', '/user/profile');
        cy.contains('h1', 'Edit Profil').should('be.visible');
    });
});
