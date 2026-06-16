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
    it('Harus menampilkan banner status verifikasi relawan untuk pengguna dengan role user', () => {
        cy.visit('/user/profile');
        cy.wait(1000);

        cy.contains('Status Verifikasi').should('be.visible');
    });
});
