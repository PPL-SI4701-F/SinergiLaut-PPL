describe('FR-17: Riwayat aktivitas pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved1@user.com', 'Password@2026');
    });
    it('Harus menampilkan beberapa entri riwayat dengan status pendaftaran yang berbeda-beda', () => {
        cy.visit(`/user/dashboard`);
        
        // These are activities approved1 is registered to
        cy.contains('Bersih Pantai Kuta').should('exist');
        cy.contains('Rehabilitasi Terumbu Karang Menjangan').should('exist');
        cy.contains('Ekspedisi Terumbu Karang Raja Ampat').should('exist');

        cy.contains(/attended|selesai|hadir/i).should('exist');
        cy.contains(/approved|diterima|disetujui/i).should('exist');
        cy.contains(/pending|menunggu/i).should('exist');
    });
});