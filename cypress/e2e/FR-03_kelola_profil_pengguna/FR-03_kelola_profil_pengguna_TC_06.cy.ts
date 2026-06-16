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
    it('Harus membatasi input NIK hanya menerima 16 digit angka', () => {
        cy.visit('/user/profile');
        cy.wait(1000);

        cy.get('input#nik').invoke('prop', 'disabled', false).clear().type('123abc456').should('have.value', '123abc456');
        cy.get('input#nik').should('have.attr', 'maxlength', '16');
    });
});
