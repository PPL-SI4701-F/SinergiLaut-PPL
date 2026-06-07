describe('Login Flow', () => {
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

  const mockSession = {
    access_token: 'fake-access-token',
    refresh_token: 'fake-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  beforeEach(() => {
    // Clear cookies/localStorage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('1. Harus menampilkan halaman login dengan benar', () => {
    cy.visit('/login');
    cy.get('h2').contains('Selamat Datang').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').contains('Masuk ke Akun').should('be.visible');
  });

  it('2. Harus berhasil login dengan input yang valid', () => {
    // Intercept Login
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 200,
      body: mockSession,
    }).as('loginRequest');

    cy.visit('/login');
    
    // Perform Login
    cy.get('input[id="email"]').type('test@example.com');
    cy.get('input[id="password"]').type('ValidPass123!');
    cy.contains('button', 'Masuk ke Akun').click();

    cy.wait('@loginRequest');

    // Verify success toast (Middleware will redirect back to login since mock token is invalid on server, so we just check toast)
    cy.contains('Login berhasil!').should('be.visible');
  });

  it('3. Harus menampilkan pesan validasi untuk input yang salah', () => {
    // Intercept Login to return error
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 400,
      body: {
        error: 'bad_request',
        error_description: 'Invalid login credentials',
      },
    }).as('loginRequestFail');

    cy.visit('/login');
    cy.wait(1000); // Wait for hydration
    cy.get('input[id="email"]').type('wrong@example.com');
    cy.get('input[id="password"]').type('wrongpass');
    cy.contains('button', 'Masuk ke Akun').click();

    cy.wait('@loginRequestFail');
    cy.contains('Email atau password salah').should('be.visible');
  });
});
