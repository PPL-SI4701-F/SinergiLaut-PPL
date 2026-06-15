describe('FR-11: Pelaporan kegiatan & transparansi dana', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved2@user.com', 'Password@2026');
    });
    it('Harus tidak menampilkan item laporan yang belum tervalidasi (status bukan "validated")', () => {
        cy.task('getActivityIdByTitle', 'Bersih Pantai Besar Bunaken').then((id) => {
            cy.visit(`/activities/${id}`);
        });

        cy.contains(/Transparansi|Laporan|Penggunaan Dana/i).click({ force: true });

        // "Bersih Pantai Besar Bunaken" report status is 'submitted', so it's not validated. 
        // Thus, none of its fund items should be visible yet.
        cy.contains('Peralatan Kebersihan').should('not.exist');
    });
});