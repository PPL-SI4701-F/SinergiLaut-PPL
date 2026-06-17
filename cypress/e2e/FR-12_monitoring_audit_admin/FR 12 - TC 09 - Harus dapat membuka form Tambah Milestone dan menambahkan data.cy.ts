describe('FR-12: Kelola Konten Journey (/admin/journey)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('FR 12 - Harus dapat membuka form Tambah Milestone dan menambahkan data - TC 09', () => {
        cy.visit('/admin/journey');
        // Buka form
        cy.contains('Tambah Milestone').click();
        cy.contains('Tambah Milestone Baru').should('be.visible');

        // Cek field form dan isi data
        const uniqueId = Date.now().toString().slice(-4);
        
        cy.get('input[type="number"]').first().as('yearInput');
        cy.get('@yearInput').type('{selectAll}2026');
        
        cy.get('input[placeholder*="Contoh: Platform Diluncurkan"]').as('titleInput');
        cy.get('@titleInput').clear();
        cy.get('@titleInput').type(`Milestone Baru ${uniqueId}`);
        
        cy.get('textarea').as('descInput');
        cy.get('@descInput').clear();
        cy.get('@descInput').type('Deskripsi milestone baru testing');

        // Simpan
        cy.contains('button', 'Simpan').click();

        // Verifikasi milestone tertambah
        cy.contains(/berhasil/i).should('be.visible');
        cy.contains(`Milestone Baru ${uniqueId}`).should('be.visible');
    });
});
