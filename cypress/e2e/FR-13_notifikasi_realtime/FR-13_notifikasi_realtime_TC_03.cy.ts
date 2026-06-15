describe('FR-13: Notifikasi Real-time Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('userPending2@user.com', 'Password@2026');
    });
    it('Harus menampilkan kondisi kosong saat tidak ada notifikasi', () => {
        cy.visit('/');
        cy.wait(1000);

        cy.get('button[aria-label="Notifikasi"]').click();
        cy.contains('Tidak ada notifikasi').should('be.visible');
    });
});
