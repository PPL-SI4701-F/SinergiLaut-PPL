describe('FR-11: Pelaporan kegiatan & transparansi dana', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved2@user.com', 'Password@2026');
    });

    it('Harus menampilkan laporan transparansi untuk kegiatan yang telah selesai', () => {
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id) => {
            cy.visit(`/activities/${id}`);
        });

        cy.contains(/Transparansi|Laporan|Penggunaan Dana/i).click({ force: true });

        cy.contains('Sewa Kapal dan Transportasi Laut').should('be.visible');
        cy.contains('Rp 4.500.000').should('be.visible');

        cy.contains('Konsumsi dan Logistik Relawan').should('be.visible');
        cy.contains('Rp 2.000.000').should('be.visible');

        cy.contains('Total Penggunaan').should('be.visible');
        cy.contains('Rp 15.000.000').should('exist');
    });
});