describe('FR-05: Manajemen kegiatan konservasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role community.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('owner1@example.com', 'Password@2026');
    });
    it('Harus menampilkan tombol Upload Laporan untuk kegiatan berstatus Selesai', () => {
        cy.visit('/community/dashboard');
        cy.wait(1000);

        cy.contains('Ekspedisi Terumbu Karang Raja Ampat').parents('.border-border').within(() => {
            cy.contains('a', /Upload Laporan|Lihat Laporan/)
                .should('have.attr', 'href')
                .and('include', '/report');
        });
    });
});
