describe('FR-15: Monitoring progress kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // Can be any user/community to see progress
    });
    it('Harus menampilkan progress sesuai data saat belum ada relawan yang mendaftar', () => {
        cy.task('getActivityIdByTitle', 'Edukasi Pesisir untuk Anak Lombok').then((id) => {
            cy.visit(`/activities/${id}`);
        });

        // 0 relawan dari 15
        cy.contains(/0\s*\/\s*15|0 relawan|0%/i).should('exist');
        
        // Dana 1.500.000 dari 6.000.000
        cy.contains(/1\.?500\.?000/i).should('exist');
    });
});