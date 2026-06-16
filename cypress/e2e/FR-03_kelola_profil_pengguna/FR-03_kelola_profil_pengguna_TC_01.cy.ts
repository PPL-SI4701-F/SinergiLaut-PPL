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
