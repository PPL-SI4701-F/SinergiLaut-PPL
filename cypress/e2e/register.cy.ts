describe('Registration Flow', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('1. Should display registration page correctly', () => {
    cy.visit('/register');
    cy.wait(500);
    cy.contains('h2', 'Bergabung dengan SinergiLaut').should('be.visible');
    cy.get('.reg-role-card.volunteer').should('be.visible');
    cy.get('.reg-role-card.community-c').should('be.visible');
  });

  it('2. Should navigate through all registration steps with valid inputs', () => {
    cy.visit('/register');
    cy.wait(500);

    // Step 1: Pilih role Volunteer
    cy.get('.reg-role-card.volunteer').should('be.visible').click();

    // Step 2: Semua field harus muncul
    cy.get('input[name="fullName"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="confirmPassword"]').should('be.visible');

    // Isi form dengan data valid
    cy.get('input[name="fullName"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="phone"]').type('08123456789');
    cy.get('input[name="password"]').type('ValidPass123!');
    cy.get('input[name="confirmPassword"]').type('ValidPass123!');

    // Lanjut ke Step 3
    cy.contains('button', 'Lanjutkan').click();

    // Step 3: Konfirmasi harus muncul beserta ringkasan data
    cy.contains('h2', 'Konfirmasi Data').should('be.visible');
    cy.contains('button', 'Daftar Sekarang').should('be.visible');
    cy.contains('test@example.com').should('be.visible');
    cy.contains('Test User').should('be.visible');
  });

  it('3. Should enforce minimum password length of 8 characters and match validation', () => {
    cy.visit('/register');
    cy.wait(500);
    cy.get('.reg-role-card.volunteer').should('be.visible').click();

    cy.get('input[name="fullName"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');

    // Verifikasi atribut HTML5 minlength=8 ada di input password
    cy.get('input[name="password"]').should('have.attr', 'minlength', '8');

    // Test password mismatch — gunakan password >= 8 karakter agar browser tidak memblokir submit
    cy.get('input[name="password"]').type('ValidPass123!');
    cy.get('input[name="confirmPassword"]').type('Different123!');

    // Inline hint muncul saat mengetik (sebelum submit)
    cy.contains('Password tidak cocok').should('be.visible');

    // Klik Lanjutkan → custom validation handleStep2Submit juga harus tampilkan error
    cy.contains('button', 'Lanjutkan').click();
    cy.contains('Password tidak cocok').should('be.visible');
  });

  it('4. Should show error when registering with an already used email', () => {
    cy.visit('/register');
    cy.wait(500);
    cy.get('.reg-role-card.volunteer').should('be.visible').click();

    cy.get('input[name="fullName"]').type('Test User');
    cy.get('input[name="email"]').type('existing@example.com');
    cy.get('input[name="phone"]').type('08123456789');
    cy.get('input[name="password"]').type('ValidPass123!');
    cy.get('input[name="confirmPassword"]').type('ValidPass123!');

    cy.contains('button', 'Lanjutkan').click();

    // Step 3 harus muncul
    cy.contains('h2', 'Konfirmasi Data').should('be.visible');
    cy.contains('button', 'Daftar Sekarang').click();

    // Error ditampilkan di div .reg-error (server action response)
    cy.get('.reg-error', { timeout: 15000 }).should('be.visible');
  });
});
