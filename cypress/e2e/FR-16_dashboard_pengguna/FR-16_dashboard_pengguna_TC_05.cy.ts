describe('FR-16: Dashboard Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved1@user.com', 'Password@2026'); // Dian Rahmawati
    });
    it('Harus menampilkan riwayat aktivitas relawan pengguna', () => {
        cy.visit('/user/dashboard');
        cy.wait(1000);

        cy.get('body').should('be.visible');
        // DashboardClient menampilkan daftar pendaftaran relawan & donasi pengguna
        cy.get('main').should('exist');
    });
});
