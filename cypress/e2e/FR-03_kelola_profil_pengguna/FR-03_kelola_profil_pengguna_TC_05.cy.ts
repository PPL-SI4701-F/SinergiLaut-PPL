describe('FR-03: Mengelola Profil Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        const testEmail = `fr03_${Math.random().toString(36).substring(2, 10)}@user.com`;
        cy.task('createVolunteerUser', {
            email: testEmail,
            password: 'Password@2026',
            fullName: 'Seeded User',
            phone: '081234567890'
        }).then(() => {
            cy.login(testEmail, 'Password@2026');
        });
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
