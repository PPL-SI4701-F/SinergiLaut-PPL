describe('FR-17: Riwayat aktivitas pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved1@user.com', 'Password@2026');
    });

    it('Harus menampilkan riwayat kegiatan di dashboard pengguna', () => {
        cy.visit(`/user/dashboard`);
        
        // Use realistic names from DB
        cy.contains('Ekspedisi Terumbu Karang Raja Ampat').should('exist');
        cy.contains(/attended|selesai|hadir/i).should('exist');
    });
});