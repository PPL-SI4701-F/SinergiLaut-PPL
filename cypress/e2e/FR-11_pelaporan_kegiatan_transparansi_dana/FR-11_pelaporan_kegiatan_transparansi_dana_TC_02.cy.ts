describe('FR-11: Pelaporan kegiatan & transparansi dana', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved2@user.com', 'Password@2026');
    });
    it('Harus menampilkan kondisi kosong saat kegiatan selesai belum memiliki laporan', () => {
        cy.task('getActivityIdByTitle', 'Survei Populasi Ikan Karang Wakatobi').then((id) => {
            cy.visit(`/activities/${id}`);
        });

        cy.contains(/Transparansi|Laporan|Penggunaan Dana/i).click({ force: true });

        // Verify the empty state message is shown
        cy.contains(/belum ada laporan|tidak ada laporan|no report|laporan belum tersedia/i).should(
            'be.visible'
        );
    });
});