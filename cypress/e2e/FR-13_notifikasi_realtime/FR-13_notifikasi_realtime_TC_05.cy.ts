describe('FR-13: Notifikasi Real-time Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026');
    });
    it('Harus menampilkan ikon lonceng notifikasi pada semua role yang login (komunitas)', () => {
        cy.clearCookies();
        cy.setCookie('e2e-bypass-auth', 'community');
        cy.visit('/');
        cy.wait(1000);

        cy.get('button[aria-label="Notifikasi"]').should('be.visible');
    });
});
