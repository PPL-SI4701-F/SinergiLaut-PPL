describe('FR-12: Verifikasi Pengguna (/admin/users)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });

    it('Harus menampilkan daftar pengguna dengan filter tab dan kolom pencarian', () => {
        cy.contains('Semua').should('be.visible');
        cy.contains('Menunggu').should('be.visible');
        cy.contains('Disetujui').should('be.visible');
        cy.contains('Ditolak').should('be.visible');
        cy.get('input[placeholder*="Cari"]').should('be.visible');
    });
});
