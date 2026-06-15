describe('FR-17: Riwayat aktivitas pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved4@user.com', 'Password@2026');
    });
    it('Harus menampilkan status "ditolak" pada riwayat pendaftaran yang tidak diterima komunitas', () => {
        cy.visit(`/user/dashboard`);
        
        // Transplantasi Karang Takabonerate is rejected for userApproved4
        cy.contains('Transplantasi Karang Takabonerate').should('exist');
        cy.contains(/rejected|ditolak/i).should('exist');
    });
});