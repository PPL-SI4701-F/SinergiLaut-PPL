describe('Login Flow', () => {
    const email = 'login.user@test.local';
    const password = 'ValidPass123!';

    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('3. Harus menampilkan pesan validasi untuk input yang salah', () => {
        cy.task('seedLoginUser');

        cy.visit('/login');
        cy.get('input[id="email"]').type(email);
        cy.get('input[id="password"]').type('wrongpass');
        cy.contains('button', 'Masuk ke Akun').click();

        cy.contains('Email atau password salah').should('be.visible');
    });
});
