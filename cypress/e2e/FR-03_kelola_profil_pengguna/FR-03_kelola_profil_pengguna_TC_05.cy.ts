describe('FR-03: Mengelola Profil Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan status relawan 'pending'.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('pending1@user.com', 'Password@2026');
    });
    it('Harus menampilkan form verifikasi data diri relawan dengan field wajib', () => {
        cy.visit('/user/profile');
        cy.wait(1000);

        cy.contains('Verifikasi Data Diri Volunteer').should('be.visible');
        cy.get('input#v_full_name').should('be.visible');
        cy.get('input#date_of_birth').should('be.visible');
        cy.get('input#nik').should('be.visible').and('have.attr', 'maxlength', '16');
        cy.get('select#gender').should('be.visible');
        cy.get('input#v_phone').should('be.visible');
        cy.contains('Alamat Lengkap').should('be.visible');
        cy.contains('Unggah Foto KTP').should('be.visible');
    });
});
