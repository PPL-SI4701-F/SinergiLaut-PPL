describe('FR-13: Notifikasi Real-time Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus menampilkan ikon lonceng notifikasi pada role admin', () => {
        cy.clearCookies();
        cy.setCookie('e2e-bypass-auth', 'admin');
        cy.visit('/admin/dashboard');
        cy.wait(1000);

        cy.get('button[aria-label="Notifikasi"]').should('be.visible');
    });
});
