describe('FR-13: Notifikasi Real-time Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('userPending2@user.com', 'Password@2026');
    });

    it('Harus menampilkan ikon lonceng notifikasi pada navigasi untuk pengguna yang login', () => {
        cy.visit('/');
        cy.wait(1000);

        cy.get('button[aria-label="Notifikasi"]').should('be.visible');
    });
});
