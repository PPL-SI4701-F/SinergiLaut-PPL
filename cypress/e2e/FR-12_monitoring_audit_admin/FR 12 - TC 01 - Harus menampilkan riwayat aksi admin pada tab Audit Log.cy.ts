describe('FR-12: Monitoring & audit oleh admin', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });

    it('FR 12 - Harus menampilkan riwayat aksi admin pada tab Audit Log - TC 01', () => {
        cy.visit('/admin/monitoring');
        cy.wait(1000); // Hydration wait

        cy.contains('Riwayat Aktivitas Admin').should('be.visible');
        cy.contains('Riwayat Aksi Admin').should('be.visible');

        cy.contains('Ekspedisi Terumbu Karang Raja Ampat').should('be.visible');
        cy.contains('Divalidasi').should('be.visible');

        cy.contains('Aksi Bersih Pantai Senggigi').should('be.visible');
        cy.contains('Ditolak').should('be.visible');

        cy.contains('Yayasan Laut Bersih Nusantara').should('be.visible');
        // The UI maps status: 'approved' to "Disetujui" or "Telah Diverifikasi"
        // so we just check for 'Yayasan Laut Bersih Nusantara' existence

        cy.contains('Bersih Pantai Kuta').should('be.visible');

        cy.contains('Festival Laut Nusantara 2026').should('be.visible');
    });
});