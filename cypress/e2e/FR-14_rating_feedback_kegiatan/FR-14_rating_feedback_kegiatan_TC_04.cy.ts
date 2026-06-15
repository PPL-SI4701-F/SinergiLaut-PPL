describe('FR-14: Rating & feedback kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved3@user.com', 'Password@2026'); // Maya Sari
    });
    it('Harus menampilkan nilai rating (bintang atau angka) pada setiap ulasan yang ada', () => {
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id) => {
            cy.visit(`/activities/${id}?tab=feedback`);
        });
        cy.wait(1000);

        // Assert the review is shown
        cy.contains('Kegiatan luar biasa!').should('be.visible');
        cy.contains('Dian Rahmawati').should('be.visible');

        // Check if rating value or stars is rendered
        cy.contains(/^5$|★★★★★|5 bintang|5\/5/i).should('exist');
    });
});