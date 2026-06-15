describe('Registration Flow', () => {
    const password = 'ValidPass123!';

    beforeEach(() => {
        // Clear cookies/localStorage before each test
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('3. Harus menerapkan validasi panjang kata sandi minimal 8 karakter dan kecocokan kata sandi', () => {
        cy.visit('/register');
        cy.wait(1000);
        cy.get('.reg-role-card.volunteer').should('be.visible').click();

        cy.get('input[name="fullName"]').type('Test User');
        cy.get('input[name="email"]').type('test@example.com');

        // Type short password
        cy.get('input[name="password"]').type('short');
        cy.get('input[name="confirmPassword"]').type('short');

        // Attempt to submit
        cy.contains('button', 'Lanjutkan').click();

        // Check custom React validation message for short password
        cy.contains('Password minimal 8 karakter.').should('be.visible');

        // We can also test the React validation for mismatched passwords
        cy.get('input[name="password"]').clear().type(password);
        cy.get('input[name="confirmPassword"]').clear().type('Different123!');
        cy.contains('button', 'Lanjutkan').click();
        cy.contains('Password tidak cocok').should('be.visible');
    });
});
