describe('FR-06: Manajemen status kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role admin.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus mengizinkan admin menyetujui dan mempublikasikan kegiatan', () => {
        cy.visit('/admin/activities');

        cy.contains('Pemantauan Terumbu Karang Amed')
            .parents('.border-blue-200')
            .find('button')
            .contains(/Publis|Setujui|Approve|Publish/i)
            .click({ force: true });

        cy.contains('Kegiatan berhasil dipublikasikan').should('be.visible');
        cy.contains('Pemantauan Terumbu Karang Amed').should('not.exist');
    });
});
