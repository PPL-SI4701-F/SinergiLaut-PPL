describe('FR-10: Manajemen batas waktu donasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved2@user.com', 'Password@2026');
    });
    it('Harus memblokir donasi jika batas waktu (end_date) sudah lewat', () => {
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id: any) => {
            cy.visit(`/activities/${id}`);
        });

        // The donation button should be disabled and show warning
        cy.contains(/Batas waktu pengumpulan habis/i).should('exist');
        cy.contains(/Batas Waktu Habis/i).closest('button').should('be.disabled');
    });
});