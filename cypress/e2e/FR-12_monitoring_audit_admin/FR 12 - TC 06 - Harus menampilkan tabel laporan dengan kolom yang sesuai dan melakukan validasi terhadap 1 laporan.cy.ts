describe('FR-12: Manajemen Laporan (/admin/reports)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        const runId = Date.now();
        cy.task('seedPendingReport', { title: `TC 06 Laporan Approve ${runId}`, communityName: `Komunitas Approve ${runId}` });
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });

    it('FR 12 - Harus menampilkan tabel laporan dengan kolom yang sesuai dan melakukan validasi terhadap 1 laporan - TC 06', () => {
        cy.visit('/admin/reports');
        
        // Cek kolom tabel
        cy.contains('th', 'Laporan').should('be.visible');
        cy.contains('th', 'Komunitas').should('be.visible');
        cy.contains('th', 'Tanggal').should('be.visible');
        cy.contains('th', 'Status').should('be.visible');
        cy.contains('th', 'Aksi').should('be.visible');

        // Approve laporan
        cy.contains('TC 06 Laporan Approve').parents('tr').within(() => {
            cy.contains('button', 'Validasi').click();
        });
        
        cy.contains('Laporan berhasil divalidasi').should('be.visible');
    });
});
