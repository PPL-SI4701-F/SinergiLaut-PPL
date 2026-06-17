describe('FR-12: Manajemen Laporan (/admin/reports)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        const runId = Date.now();
        cy.task('seedPendingReport', { title: `TC 07 Laporan Reject ${runId}`, communityName: `Komunitas Reject ${runId}` });
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });

    it('FR 12 - Harus dapat melakukan pencarian laporan dan melakukan penolakan laporan - TC 07', () => {
        cy.visit('/admin/reports');
        
        // Coba fitur search
        cy.get('input[placeholder*="Cari"]').type('TC 07 Laporan Reject');
        cy.wait(500);

        // Pastikan muncul
        cy.contains('TC 07 Laporan Reject').should('be.visible');

        // Filter status "Menunggu"
        cy.contains('button', 'Menunggu').click();
        cy.wait(500);

        // Tolak laporan
        cy.contains('TC 07 Laporan Reject').parents('tr').within(() => {
            cy.contains('button', 'Tolak').click();
        });

        // Verifikasi alert / toast
        cy.contains('Laporan ditolak').should('be.visible');
    });
});
