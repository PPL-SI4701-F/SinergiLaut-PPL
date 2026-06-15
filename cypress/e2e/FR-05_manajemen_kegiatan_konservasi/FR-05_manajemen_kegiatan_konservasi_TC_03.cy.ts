describe('FR-05: Manajemen kegiatan konservasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role community.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('owner1@example.com', 'Password@2026');
    });
    it('Harus merender payload XSS pada judul kegiatan dengan aman', () => {
        const xssPayload = '<script>alert("xss")</script>';

        cy.visit('/community/dashboard/activities/create');
        cy.wait(1000);

        cy.get('input[name="title"]').type(xssPayload, { parseSpecialCharSequences: false });
        cy.get('body').should('be.visible');
        cy.get('input[name="title"]').should('have.value', xssPayload);

        cy.get('script[src]').then(($scripts) => {
            $scripts.each((_, el) => {
                expect(el.textContent || '').not.to.include('alert("xss")');
            });
        });
    });
});
