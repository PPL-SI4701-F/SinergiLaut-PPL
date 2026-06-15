describe('Login Flow', () => {
  const email = 'login.user@test.local';
  const password = 'ValidPass123!';

  beforeEach(() => {
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
    cy.task('seedLoginUser');

    cy.visit('/login');

    cy.get('input[id="email"]').type(email);
    cy.get('input[id="password"]').type(password);
    cy.contains('button', 'Masuk ke Akun').click();

    cy.url().should('include', '/user/dashboard');
  });

  it('3. Harus menampilkan pesan validasi untuk input yang salah', () => {
    cy.task('seedLoginUser');

    cy.visit('/login');
    cy.get('input[id="email"]').type(email);
    cy.get('input[id="password"]').type('wrongpass');
    cy.contains('button', 'Masuk ke Akun').click();

    cy.contains('Email atau password salah').should('be.visible');
  });
});
