describe('Login Flow', () => {
    const email = 'login.user@test.local';
    const password = 'ValidPass123!';

    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('2. Harus berhasil login dengan input yang valid', () => {
        cy.task('seedLoginUser');

        cy.visit('/login');

        cy.get('input[id="email"]').type(email);
        cy.get('input[id="password"]').type(password);
        cy.contains('button', 'Masuk ke Akun').click();

        cy.url().should('include', '/user/dashboard');
    });
});
