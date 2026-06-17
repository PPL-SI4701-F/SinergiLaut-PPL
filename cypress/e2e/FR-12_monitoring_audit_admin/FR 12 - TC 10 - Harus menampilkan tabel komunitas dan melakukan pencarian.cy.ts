describe('FR-12: Sanksi Komunitas (/admin/communities)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });

    it('FR 12 - Harus menampilkan tabel komunitas dan melakukan pencarian - TC 10', () => {
        cy.visit('/admin/communities');
        cy.contains('Kelola Komunitas').should('be.visible');
        
        // Buat seed unik
        const runId = Date.now();
        const communityName = `TC 10 Cari Komunitas ${runId}`;
        const email = `tc10cari${runId}@test.com`;
        cy.task('seedPendingCommunity', { name: communityName, email });

        // Refresh untuk dapatkan data terbaru
        cy.reload();
        
        // Lakukan pencarian
        cy.get('input[placeholder*="Cari"]').clear().type('TC 10 Cari Komunitas');
        cy.wait(500);

        cy.contains(communityName).should('be.visible');
    });
});
