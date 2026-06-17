describe('FR-12: Verifikasi Pengguna (/admin/users)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        const runId = Date.now();
        cy.task('seedPendingVolunteer', { name: "TC 03 Approve", email: `tc03approve-${runId}@volunteer.com` });
        cy.task('seedPendingVolunteer', { name: "TC 03 Reject", email: `tc03reject-${runId}@volunteer.com` });
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });

    it('FR 12 - Harus menampilkan daftar pengguna dengan filter tab dan kolom pencarian dan melakukan penolakan terhadap 1 pengguna dan melakukan verifikasi pengguna - TC 03', () => {
        cy.visit('/admin/users');
        
        // Verifikasi tab dan search bar
        cy.contains('Semua').should('be.visible');
        cy.contains('Menunggu').should('be.visible');
        cy.contains('Disetujui').should('be.visible');
        cy.contains('Ditolak').should('be.visible');
        cy.get('input[placeholder*="Cari"]').should('be.visible');

        // Filter tab Menunggu
        cy.contains('button', 'Menunggu').click();
        cy.wait(500);

        // Approve
        cy.contains('button', 'TC 03 Approve').click();
        cy.contains('button', 'Setujui Verifikasi').click();
        cy.contains('Volunteer berhasil diverifikasi').should('be.visible');

        cy.wait(500);

        // Reject
        cy.contains('button', 'TC 03 Reject').click();
        cy.contains('button', 'Tolak').click();
        
        cy.contains('Tolak Verifikasi').should('be.visible');
        cy.get('textarea').type('Dokumen tidak valid atau buram.');
        cy.get('div[role="dialog"]').contains('button', 'Konfirmasi Tolak').click();
        
        cy.contains('Verifikasi volunteer ditolak.').should('be.visible');
    });
});
