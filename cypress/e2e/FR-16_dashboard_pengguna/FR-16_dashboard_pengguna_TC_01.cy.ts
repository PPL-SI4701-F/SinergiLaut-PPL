describe('FR-16: Dashboard Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved1@user.com', 'Password@2026'); // Dian Rahmawati
    });

    it('Harus menampilkan halaman dashboard pengguna dengan sapaan dan status verifikasi', () => {
        cy.visit('/user/dashboard');
        cy.wait(1000);

        cy.contains('Selamat datang').should('be.visible');
        cy.contains('Dian Rahmawati', { matchCase: false }).should('exist');
        cy.contains('Terverifikasi').should('be.visible');
        cy.contains('Pantau partisipasi dan riwayat Anda di SinergiLaut').should('be.visible');
    });
});
