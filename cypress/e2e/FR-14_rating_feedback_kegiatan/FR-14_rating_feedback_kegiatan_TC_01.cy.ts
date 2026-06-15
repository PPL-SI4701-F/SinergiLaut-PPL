describe('FR-14: Rating & feedback kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved3@user.com', 'Password@2026'); // Maya Sari
    });

    it('Harus mengizinkan pengguna mengirim ulasan dan menampilkannya di halaman publik', () => {
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id) => {
            cy.visit(`/activities/${id}?tab=feedback`);
        });
        cy.wait(1000);

        // Click stars
        cy.get('.flex.items-center.gap-1 button').last().click({ force: true });
        
        // Type review
        cy.get('textarea').clear().type('Bagus!');
        
        // Submit
        cy.contains('button', /Kirim|Submit|Perbarui/i).click();
        
        // Reload page to verify it persisted
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id) => {
            cy.visit(`/activities/${id}?tab=feedback`);
        });

        // The review text we just typed
        cy.contains('Bagus!').should('be.visible');
        
        // The reviewer's name (Maya Sari)
        cy.contains('Maya Sari').should('be.visible');
    });
});