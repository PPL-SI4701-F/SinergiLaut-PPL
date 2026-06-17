describe('FR-12: Sanksi Komunitas (/admin/communities)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('FR 12 - Harus dapat melakukan aksi Ban Permanen terhadap komunitas - TC 11', () => {
        const runId = Date.now();
        const communityName = `TC 11 Banned Komunitas ${runId}`;
        const email = `tc11ban${runId}@test.com`;
        cy.task('seedPendingCommunity', { name: communityName, email });

        cy.visit('/admin/communities');
        
        // Buka tab Semua Komunitas jika ada atau scroll
        cy.contains('Semua Komunitas').should('be.visible');

        // Cari komunitas kita
        cy.get('input[placeholder*="Cari"]').clear().type('TC 11 Banned Komunitas');
        cy.wait(500);

        // Buka dropdown dari dalam tabel (karena di pending tab berupa card/div)
        cy.get('table').contains(communityName).parents('tr').find('button').first().click({ force: true });
        cy.contains('Beri Sanksi').click({ force: true });

        // Verifikasi modal & pilih Ban Permanen
        cy.contains('Peringatan').should('be.visible');
        cy.contains('Ban Permanen').click();
        
        // Isi alasan
        cy.get('textarea').type('Melanggar aturan berat');
        cy.contains('button', 'Berikan Sanksi').click();

        // Cek toast
        cy.contains('Sanksi diberikan pada').should('be.visible');
    });
});
