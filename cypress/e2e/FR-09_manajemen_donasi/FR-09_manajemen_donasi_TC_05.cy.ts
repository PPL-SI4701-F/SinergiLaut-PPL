describe('FR-09: Manajemen donasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026');
        
        // Ambil ID kegiatan "Bersih Pantai Kuta — Aksi Nyata Lawan Plastik" dari database riil
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').as('activityId');
    });
    it('Harus mengarahkan pengguna dengan role user (bukan komunitas) ke halaman yang sesuai', () => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('pending1@user.com', 'Password@2026');

        cy.get('@activityId').then((id) => {
            cy.visit(`/community/dashboard/activities/${id}/donors`);
        });
        cy.wait(1000);

        // Non-community users should be redirected away from community dashboard
        cy.url().should('satisfy', (url: string) =>
            url.includes('/login') ||
            url.includes('/unauthorized') ||
            url.includes('/user/dashboard') ||
            !url.includes('/community/dashboard'),
        );
    });
});
