describe('Login Flow', () => {
    const email = 'login.user@test.local';
    const password = 'ValidPass123!';

    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('1. Harus menampilkan halaman login dengan benar', () => {
        cy.visit('/login');
        cy.get('h2').contains('Selamat Datang').should('be.visible');
        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="password"]').should('be.visible');
        cy.get('button[type="submit"]').contains('Masuk ke Akun').should('be.visible');
    });
});
