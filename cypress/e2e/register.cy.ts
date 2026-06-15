describe('Registration Flow', () => {
  const password = 'ValidPass123!';

  beforeEach(() => {
    // Clear cookies/localStorage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('1. Harus menampilkan halaman registrasi dengan benar', () => {
    cy.visit('/register');
    cy.get('h2').contains('Bergabung dengan SinergiLaut').should('be.visible');
    cy.get('.reg-role-card.volunteer').should('be.visible');
    cy.get('.reg-role-card.community-c').should('be.visible');
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
