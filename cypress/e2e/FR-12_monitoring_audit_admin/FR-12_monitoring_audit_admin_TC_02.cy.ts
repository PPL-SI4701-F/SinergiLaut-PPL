describe('FR-12: Monitoring & audit oleh admin', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus dapat berpindah ke tab Kelola Komunitas', () => {
        cy.visit('/admin/monitoring');
        cy.wait(1000);


        // Sidebar uses Link with label "Komunitas"
        cy.contains('Komunitas').click({ force: true });
        cy.contains('Kelola Komunitas').should('be.visible'); // page title in /admin/communities
    });
});
