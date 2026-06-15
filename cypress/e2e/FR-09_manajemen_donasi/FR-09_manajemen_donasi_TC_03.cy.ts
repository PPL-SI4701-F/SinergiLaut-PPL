describe('FR-09: Manajemen donasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026');
        
        // Ambil ID kegiatan "Bersih Pantai Kuta — Aksi Nyata Lawan Plastik" dari database riil
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').as('activityId');
    });
    it('Harus menampilkan nominal donasi dalam format mata uang Rupiah yang benar', () => {
        cy.get('@activityId').then((id) => {
            cy.visit(`/community/dashboard/activities/${id}/donors`);
        });
        cy.wait(1000);

        // Both donors and their amounts must be visible
        cy.contains('Budi Santoso').should('be.visible');
        cy.contains('Wahyu Hidayat').should('be.visible');

        // Amounts must be formatted in Indonesian Rupiah (Rp)
        cy.contains(/Rp[\s\d.,]+/).should('be.visible');
    });
});
