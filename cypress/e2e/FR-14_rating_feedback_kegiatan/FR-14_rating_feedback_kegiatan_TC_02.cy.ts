describe('FR-14: Rating & feedback kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved3@user.com', 'Password@2026'); // Maya Sari
    });
    it('Harus menampilkan semua feedback dari beberapa pengguna berbeda', () => {
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id) => {
            cy.visit(`/activities/${id}?tab=feedback`);
        });
        cy.wait(1000);

        // Dian Rahmawati's feedback
        cy.contains('Kegiatan luar biasa!').should('be.visible');
        cy.contains('Dian Rahmawati').should('be.visible');

        // Fajar Nugroho's feedback
        cy.contains('Sangat bermanfaat.').should('be.visible');
        cy.contains('Fajar Nugroho').should('be.visible');
    });
});