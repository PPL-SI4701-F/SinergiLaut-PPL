describe('FR-04: Verifikasi Akun Komunitas oleh Admin', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role admin.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus dapat mencari komunitas melalui kolom pencarian', () => {
        cy.visit('/admin/communities');
        cy.wait(1000);

        cy.get('input[placeholder="Cari komunitas..."]').type('Mangrove');
        cy.contains('Relawan Mangrove Kalimantan').should('be.visible');
        cy.contains('Yayasan Laut Bersih Nusantara').should('not.exist');

        cy.get('input[placeholder="Cari komunitas..."]').clear();
        cy.contains('Yayasan Laut Bersih Nusantara').should('be.visible');
    });
});
