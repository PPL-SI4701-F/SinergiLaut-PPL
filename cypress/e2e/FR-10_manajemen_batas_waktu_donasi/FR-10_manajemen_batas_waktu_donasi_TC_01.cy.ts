describe('FR-10: Manajemen batas waktu donasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved2@user.com', 'Password@2026');
    });

    it('Harus mengizinkan donasi jika batas waktu (end_date) masih di masa depan', () => {
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').then((id: any) => {
            cy.visit(`/activities/${id}`);
        });

        // The donation form/button should exist and be enabled
        cy.contains('button', /Donasi/i).should('not.be.disabled');
    });
});