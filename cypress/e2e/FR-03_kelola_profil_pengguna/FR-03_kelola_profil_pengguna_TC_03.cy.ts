describe('FR-03: Mengelola Profil Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan status relawan 'pending'.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('pending1@user.com', 'Password@2026');
    });
    it('Harus menampilkan batas karakter pada nama dan bio', () => {
        cy.visit('/user/profile');
        cy.wait(1000);

        cy.get('input#full_name').should('have.attr', 'maxlength', '100');
        cy.get('textarea#bio').should('have.attr', 'maxlength', '300');
        cy.contains('/100').should('be.visible');
        cy.contains('/300').should('be.visible');
    });
});
