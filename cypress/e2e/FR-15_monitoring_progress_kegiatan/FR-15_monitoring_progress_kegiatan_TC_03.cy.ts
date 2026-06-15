describe('FR-15: Monitoring progress kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // Can be any user/community to see progress
    });
    it('Harus menampilkan indikator penuh saat kuota relawan dan target dana tercapai 100%', () => {
        cy.task('getActivityIdByTitle', 'Bersih Pantai Besar Bunaken').then((id) => {
            cy.visit(`/activities/${id}`);
        });

        // 80/80 relawan
        cy.contains('80').should('exist');
        
        // Dana 10.000.000
        cy.contains(/10\.?000\.?000/i).should('exist');
        
        // Indikator terpenuhi/full
        cy.contains(/100%|kuota penuh|terpenuhi|fully funded|full/i).should('exist');
    });
});