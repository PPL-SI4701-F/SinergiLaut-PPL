describe('FR-04: Verifikasi Akun Komunitas oleh Admin', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role admin.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus berhasil menolak komunitas dan menampilkan notifikasi info', () => {
        cy.visit('/admin/communities');
        cy.wait(1000);

        cy.contains('Forum Konservasi Laut Maluku').closest('.rounded-xl').within(() => {
            cy.contains('button', 'Tolak').click();
        });

        cy.get('textarea[placeholder*="Contoh: dokumen"]').type('Data tidak lengkap');
        cy.get('dialog, [role="dialog"]').contains('button', 'Tolak Komunitas').click();

        cy.contains('Komunitas ditolak.').should('be.visible');
    });
});
