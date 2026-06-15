describe('FR-05: Manajemen kegiatan konservasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role community.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('owner1@example.com', 'Password@2026');
    });
    it('Harus menampilkan dialog konfirmasi dan membatalkan aksi jika memilih Tidak', () => {
        cy.visit('/community/dashboard');
        cy.wait(1000);

        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD').parents('.border-border').within(() => {
            cy.contains('button', 'Batalkan').click();
        });

        cy.contains('Batalkan kegiatan ini?').should('be.visible');
        cy.contains('Tindakan ini tidak dapat diurungkan.').should('be.visible');

        cy.contains('button', 'Tidak').click();
        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD').should('be.visible');
    });
});
