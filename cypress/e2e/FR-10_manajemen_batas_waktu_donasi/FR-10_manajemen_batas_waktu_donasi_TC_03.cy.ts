describe('FR-10: Manajemen batas waktu donasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved2@user.com', 'Password@2026');
    });

    it('Harus menampilkan countdown sisa waktu pengumpulan ketika deadline masih aktif', () => {
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').then((id: any) => {
            cy.visit(`/activities/${id}`);
        });

        // Verify that the countdown text is visible and contains orange color class
        cy.contains(/Sisa waktu pengumpulan: \d+ hari lagi/i)
            .should('be.visible')
            .and('have.class', 'text-orange-600');
    });
});
