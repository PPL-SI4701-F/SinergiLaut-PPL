describe('FR-15: Monitoring progress kegiatan - TC-01', () => {
    beforeEach(() => {
        cy.exec('npm run db:reset:e2e', { timeout: 150000 });
        cy.wait(5000);
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Login menggunakan akun pengguna', () => {
        // Step 1: akses menu login
        cy.visit('/login');
        
        // Step 2 & 3: mengisi email dan password
        cy.get('input#email').clear().type('approved1@user.com');
        cy.get('input#password').clear().type('Password@2026');
        
        // Step 4: klik tombol "masuk ke akun"
        cy.get('button[type="submit"]').click();
        
        // Step 5 & Expected Result: pengguna bisa masuk ke halaman dashboard pengguna
        cy.url({ timeout: 15000 }).should('include', '/user/dashboard');
        cy.contains(/Ringkasan|Dashboard/i).should('exist');
    });
});