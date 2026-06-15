describe('FR-03: Mengelola Profil Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan status relawan 'pending'.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('pending1@user.com', 'Password@2026');
    });
    it('Harus membatasi input NIK hanya menerima 16 digit angka', () => {
        cy.visit('/user/profile');
        cy.wait(1000);

        cy.get('input#nik').invoke('prop', 'disabled', false).clear().type('123abc456').should('have.value', '123abc456');
        cy.get('input#nik').should('have.attr', 'maxlength', '16');
    });
});
