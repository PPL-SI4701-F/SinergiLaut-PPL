describe('FR-03: Mengelola Profil Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan status relawan 'pending'.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('pending1@user.com', 'Password@2026');
    });

    it('Harus menampilkan halaman edit profil dengan data pengguna', () => {
        cy.visit('/user/profile');
        cy.wait(1000);

        cy.contains('h1', 'Edit Profil').should('be.visible');
        cy.contains('Informasi Pribadi').should('be.visible');
        cy.get('input#full_name').should('be.visible');
        cy.get('input#phone').should('be.visible');
        cy.get('textarea#bio').should('be.visible');

        // Email field is read-only
        cy.contains('Email tidak dapat diubah').should('be.visible');
    });
});
