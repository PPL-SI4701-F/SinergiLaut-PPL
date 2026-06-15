describe('FR-05: Manajemen kegiatan konservasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role community.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('owner1@example.com', 'Password@2026');
    });
    it('Harus menampilkan daftar kegiatan dengan berbagai status di dashboard komunitas', () => {
        cy.visit('/community/dashboard');
        cy.wait(1000);

        cy.contains('Kelola Kegiatan').should('be.visible');
        cy.contains('Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').should('be.visible');
        cy.contains('Rencana Bersih Pantai Sanur').should('be.visible');
        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD').should('be.visible');
        cy.contains('Ekspedisi Terumbu Karang Raja Ampat').should('be.visible');
        cy.contains('Festival Laut Nusantara 2026').should('be.visible');
    });
});
