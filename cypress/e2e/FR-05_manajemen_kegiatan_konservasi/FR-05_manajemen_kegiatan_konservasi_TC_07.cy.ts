describe('FR-05: Manajemen kegiatan konservasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role community.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('owner1@example.com', 'Password@2026');
    });
    it('Harus berhasil membatalkan kegiatan berstatus Menunggu Review', () => {
        cy.visit('/community/dashboard');
        cy.wait(1000);

        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD').parents('.border-border').within(() => {
            cy.contains('button', 'Batalkan').click();
        });

        cy.contains('Ya, Batalkan').click();
        cy.contains('berhasil dibatalkan').should('be.visible');
    });
});
