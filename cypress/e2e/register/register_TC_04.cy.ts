describe('Registration Flow', () => {
    const password = 'ValidPass123!';

    beforeEach(() => {
        // Clear cookies/localStorage before each test
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('4. Harus tidak membuat profile duplikat saat email yang sama didaftarkan ulang', () => {
        const unique = Date.now();
        const email = `dewi.lestari.${unique}@example.com`;
        const fullName = 'Dewi Lestari';
        const phone = '082112345679';

        cy.task('createVolunteerUser', { email, password, fullName, phone });
        cy.task('findProfileByEmail', { email }).should('not.equal', null);

        cy.task('createVolunteerUser', { email, password, fullName, phone });
        cy.task('countProfilesByEmail', { email }).then((count) => {
            expect(count).to.equal(1);
        });
    });
});
