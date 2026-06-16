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
    it('Harus menampilkan batas karakter pada nama dan bio', () => {
        cy.visit('/user/profile');
        cy.wait(1000);

        cy.get('input#full_name').should('have.attr', 'maxlength', '100');
        cy.get('textarea#bio').should('have.attr', 'maxlength', '300');
        cy.contains('/100').should('be.visible');
        cy.contains('/300').should('be.visible');
    });
});
