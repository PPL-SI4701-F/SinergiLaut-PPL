describe('FR-03: Mengelola Profil Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan status relawan 'pending'.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('pending1@user.com', 'Password@2026');
    });
    it('Harus mengizinkan pengguna mengubah nama, nomor telepon, dan bio lalu menyimpan', () => {
        cy.visit('/user/profile');
        cy.wait(1000);

        cy.get('input#full_name').clear().type('Budi Santoso Updated');
        cy.get('input#phone').clear().type('081234567890');
        cy.get('textarea#bio').clear().type('Saya peduli pada kelestarian laut Indonesia.');

        cy.contains('button', 'Simpan Perubahan').click();
    });
});
