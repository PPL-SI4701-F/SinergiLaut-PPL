describe('FR-16: Dashboard Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved1@user.com', 'Password@2026'); // Dian Rahmawati
    });
    it('Harus menyediakan tautan untuk mengedit profil dari dashboard', () => {
        cy.visit('/user/dashboard');
        cy.wait(1000);

        cy.contains('a', 'Edit Profil').should('have.attr', 'href', '/user/profile');
    });
});
