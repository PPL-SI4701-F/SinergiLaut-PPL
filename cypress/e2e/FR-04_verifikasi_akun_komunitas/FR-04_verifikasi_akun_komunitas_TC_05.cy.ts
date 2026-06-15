describe('FR-04: Verifikasi Akun Komunitas oleh Admin', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role admin.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus menampilkan tabel semua komunitas beserta status verifikasinya', () => {
        cy.visit('/admin/communities');
        cy.wait(1000);

        cy.contains('Semua Komunitas').should('be.visible');
        cy.contains('Komunitas Laut Lestari').should('be.visible');
        cy.contains('Komunitas Mangrove Asri').should('be.visible');
        cy.contains('Komunitas Pesisir Hijau').should('be.visible');
        cy.contains('Terverifikasi').should('be.visible');
        cy.contains('Disuspend').should('be.visible');
    });
});
