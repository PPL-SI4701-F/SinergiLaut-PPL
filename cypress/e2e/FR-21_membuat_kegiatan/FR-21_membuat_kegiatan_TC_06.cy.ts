describe('FR-21: Membuat Kegiatan Baru oleh Komunitas', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // comm1
    });
    it('Harus menyediakan tautan kembali ke dashboard komunitas', () => {
        cy.visit('/community/dashboard/activities/create');
        cy.wait(1000);

        cy.contains('a', 'Kembali ke Dashboard').should('have.attr', 'href', '/community/dashboard');
    });
});
