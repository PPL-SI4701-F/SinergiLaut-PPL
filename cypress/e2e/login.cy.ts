describe('Login Flow', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('1. Should display login page correctly', () => {
    cy.visit('/login');
    cy.wait(500);
    // h2 berisi "Selamat Datang 👋" — gunakan contains agar partial match
    cy.contains('h2', 'Selamat Datang').should('be.visible');
    cy.get('input#email').should('be.visible');
    cy.get('input#password').should('be.visible');
    // Button submit dengan teks "Masuk ke Akun"
    cy.get('button[type="submit"]').should('contain', 'Masuk ke Akun').and('be.visible');
  });

  it('2. Should show loading state when submitting', () => {
    cy.visit('/login');
    cy.wait(500);
    cy.get('input#email').type('test@example.com');
    cy.get('input#password').type('ValidPass123!');
    cy.get('button[type="submit"]').click();
    // Button menampilkan state loading saat proses login berlangsung
    cy.contains('Sedang masuk...').should('be.visible');
  });

  it('3. Should display error for incorrect credentials', () => {
    cy.visit('/login');
    cy.wait(500);
    cy.get('input#email').type('salah@example.com');
    cy.get('input#password').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    // Tunggu respons server action selesai (bukan intercept — login pakai Server Action)
    cy.contains('Email atau password salah', { timeout: 15000 }).should('be.visible');
  });
});
