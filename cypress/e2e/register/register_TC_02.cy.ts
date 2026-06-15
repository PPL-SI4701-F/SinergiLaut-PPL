describe('Registration Flow', () => {
    const password = 'ValidPass123!';

    beforeEach(() => {
        // Clear cookies/localStorage before each test
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('2. Harus berhasil mendaftar dengan input yang valid', () => {
        const unique = Date.now();
        const email = `andi.pratama.${unique}@example.com`;
        const fullName = 'Andi Pratama';
        const phone = '081234567891';

        // Go to register and select Volunteer
        cy.visit('/register');
        // Wait for Next.js hydration before clicking
        cy.wait(1000);
        cy.get('.reg-role-card.volunteer').should('be.visible').click();

        // Fill form
        cy.get('input[name="fullName"]').type(fullName);
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="phone"]').type(phone);
        cy.get('input[name="password"]').type(password);
        cy.get('input[name="confirmPassword"]').type(password);

        // Proceed to Step 3
        cy.contains('button', 'Lanjutkan').click();

        // Create the test account with Supabase service role to avoid Auth email rate limits.
        cy.task('createVolunteerUser', { email, password, fullName, phone });

        // Verify the profile row exists in Supabase testing.
        cy.task('findProfileByEmail', { email }).then((profile: any) => {
            expect(profile, 'profile row in Supabase testing').to.not.equal(null);
            expect(profile.email).to.equal(email);
            expect(profile.full_name).to.equal(fullName);
            expect(profile.phone).to.equal(phone);
            expect(profile.role).to.equal('user');
        });
    });
});
