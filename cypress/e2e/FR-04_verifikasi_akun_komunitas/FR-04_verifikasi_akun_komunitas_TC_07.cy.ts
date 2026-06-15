describe('FR-04: Verifikasi Akun Komunitas oleh Admin', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role admin.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus menampilkan kondisi kosong saat pencarian tidak menghasilkan apa pun', () => {
        cy.visit('/admin/communities');
        cy.wait(1000);

        cy.get('input[placeholder="Cari komunitas..."]').type('xqyzw123nonexistent');
        cy.contains('Tidak ada komunitas ditemukan.').should('be.visible');
    });
});
