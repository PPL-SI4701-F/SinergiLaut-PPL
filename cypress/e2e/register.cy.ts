describe('Registration Flow', () => {
  const mockUser = {
    id: 'test-user-id',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
      role: 'user',
    },
  };

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
    // Intercept Signup
    cy.intercept('POST', '**/auth/v1/signup*', {
      statusCode: 200,
      body: mockUser, // Supabase v2 signup returns the user object directly when email confirmation is on
    }).as('signupRequest');

    // Go to register and select Volunteer
    cy.visit('/register');
    // Wait for Next.js hydration before clicking
    cy.wait(1000);
    cy.get('.reg-role-card.volunteer').should('be.visible').click();

    // Fill form
    cy.get('input[name="fullName"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="phone"]').type('08123456789');
    cy.get('input[name="password"]').type('ValidPass123!');
    cy.get('input[name="confirmPassword"]').type('ValidPass123!');
    
    // Proceed to Step 3
    cy.contains('button', 'Lanjutkan').click();

    // Confirm and submit
    cy.contains('button', 'Daftar Sekarang').click();

    cy.wait('@signupRequest');

    // Verify redirect to login
    cy.url().should('include', '/login');
    cy.contains('Pendaftaran berhasil!').should('be.visible');
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
    cy.get('input[name="password"]').clear().type('ValidPass123!');
    cy.get('input[name="confirmPassword"]').clear().type('Different123!');
    cy.contains('button', 'Lanjutkan').click();
    cy.contains('Password tidak cocok').should('be.visible');
  });

  it('4. Harus menampilkan error saat membuat akun dengan email yang sudah terdaftar', () => {
    // Intercept Signup to return error
    cy.intercept('POST', '**/auth/v1/signup*', {
      statusCode: 400,
      body: {
        error_description: 'User already registered',
        msg: 'User already registered',
      },
    }).as('signupExisting');

    cy.visit('/register');
    cy.wait(1000);
    cy.get('.reg-role-card.volunteer').should('be.visible').click();

    // Fill form
    cy.get('input[name="fullName"]').type('Test User');
    cy.get('input[name="email"]').type('existing@example.com');
    cy.get('input[name="password"]').type('ValidPass123!');
    cy.get('input[name="confirmPassword"]').type('ValidPass123!');
    
    cy.contains('button', 'Lanjutkan').click();
    cy.contains('button', 'Daftar Sekarang').click();

    cy.wait('@signupExisting');
    cy.contains('User already registered').should('be.visible');
  });
});
