describe('FR-15: Monitoring progress kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // Can be any user/community to see progress
    });

    it('Harus menampilkan progress bar relawan dan pendanaan secara akurat', () => {
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').then((id) => {
            cy.visit(`/activities/${id}`);
        });

        // 4 relawan, kuota 30
        cy.contains('4').should('exist');
        cy.contains('30').should('exist');

        // Dana 6.000.000, goal 10.000.000
        cy.contains(/6\.?000\.?000/i).should('exist');
        cy.contains(/10\.?000\.?000/i).should('exist');
    });
});