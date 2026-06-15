describe('Registration Flow', () => {
    const password = 'ValidPass123!';

    beforeEach(() => {
        // Clear cookies/localStorage before each test
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('1. Harus menampilkan halaman registrasi dengan benar', () => {
        cy.visit('/register');
        cy.get('h2').contains('Bergabung dengan SinergiLaut').should('be.visible');
        cy.get('.reg-role-card.volunteer').should('be.visible');
        cy.get('.reg-role-card.community-c').should('be.visible');
    });
});
