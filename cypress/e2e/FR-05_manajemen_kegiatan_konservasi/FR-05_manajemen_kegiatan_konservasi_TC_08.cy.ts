describe('FR-05: Manajemen kegiatan konservasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role community.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('owner1@example.com', 'Password@2026');
    });
    it('Harus berhasil menghapus kegiatan berstatus Dibatalkan setelah konfirmasi', () => {
        cy.visit('/community/dashboard');
        cy.wait(1000);

        cy.contains('Festival Laut Nusantara 2026').parents('.border-border').within(() => {
            cy.contains('button', 'Hapus').click();
        });

        cy.contains('Hapus kegiatan ini?').should('be.visible');
        cy.contains('Ya, Hapus').click();
        cy.contains('berhasil dihapus').should('be.visible');
    });
});
