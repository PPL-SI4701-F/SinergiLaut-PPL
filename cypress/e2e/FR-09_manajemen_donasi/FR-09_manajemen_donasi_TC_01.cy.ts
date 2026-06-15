describe('FR-09: Manajemen donasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026');
        
        // Ambil ID kegiatan "Bersih Pantai Kuta — Aksi Nyata Lawan Plastik" dari database riil
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').as('activityId');
    });

    it('Harus menampilkan tabel donasi dan mengakumulasi total dana dengan benar', () => {
        cy.get('@activityId').then((id) => {
            cy.visit(`/community/dashboard/activities/${id}/donors`);
        });

        // Verify the donations appear in a table or list
        cy.contains('Budi Santoso').should('be.visible');
        cy.contains('Rp 500.000').should('be.visible');

        cy.contains('Wahyu Hidayat').should('be.visible');
        cy.contains('Rp 3.000.000').should('be.visible');

        // Verify the total accumulated completed funds is displayed
        cy.contains('Rp 500.000').should('be.visible');
    });
});
