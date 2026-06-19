describe('FR-09: Manajemen donasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026');
        
        // Ambil ID kegiatan "Bersih Pantai Kuta — Aksi Nyata Lawan Plastik" dari database riil
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').as('activityId');
    });
    it('Harus menampilkan halaman donatur tanpa crash dan tidak redirect ke login', () => {
        cy.get('@activityId').then((id) => {
            cy.visit(`/community/dashboard/activities/${id}/donors`);
        });
        cy.wait(1000);

        // Page must stay on the donors page — not redirect to login/unauthorized
        cy.url().should('not.include', '/login');
        cy.url().should('not.include', '/unauthorized');
        cy.get('body').should('be.visible');
        cy.get('main').should('exist');
    });
});
