describe('FR-11: Pelaporan kegiatan & transparansi dana', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved2@user.com', 'Password@2026');
    });
    it('Harus menghitung total pengeluaran secara akurat dari banyak item laporan', () => {
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id) => {
            cy.visit(`/activities/${id}`);
        });

        cy.contains(/Transparansi|Laporan|Penggunaan Dana/i).click({ force: true });

        cy.contains('Peralatan Selam dan Safety').should('be.visible');
        cy.contains('Dokumentasi dan Publikasi').should('be.visible');
        cy.contains('Bibit Karang dan Media Tanam').should('be.visible');

        cy.contains('Total Penggunaan').should('be.visible');
        cy.contains('Rp 15.000.000').should('exist');
    });
});