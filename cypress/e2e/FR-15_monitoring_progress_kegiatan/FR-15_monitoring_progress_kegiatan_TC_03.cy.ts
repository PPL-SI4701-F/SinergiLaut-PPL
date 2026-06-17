describe('FR-15: Monitoring progress kegiatan - TC-03', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Komunitas menerima Volunteer yang sudah daftar', () => {
        // Step 1: Akses menu login
        cy.visit('/login');

        // Step 2: Mengisi email komunitas
        cy.get('input#email').clear().type('owner2@example.com');
        
        // Step 3: Mengisi password
        cy.get('input#password').clear().type('Password@2026');

        // Step 4: Klik tombol "masuk ke akun"
        cy.get('button[type="submit"]').click();

        // Step 5: Pengguna bisa masuk ke halaman dashboard komunitas
        cy.url({ timeout: 15000 }).should('include', '/community/dashboard');

        // Step 6: Pencet tombol kelola pada kegiatan Edukasi pesisir untuk anak Lombok
        cy.contains('Edukasi Pesisir untuk Anak Lombok')
          .parents('.border-border')
          .contains('Kelola')
          .click();

        // Step 7: Pencet tombol "terima" pada relawan Muhamad Habibi Budiman
        cy.contains('.border-border', 'Muhamad Habibi Budiman')
          .find('button')
          .contains('Terima')
          .click();
        cy.contains('berhasil diubah', { timeout: 10000 }).should('be.visible');

        // Step 8: Klik tombol keluar
        cy.get('button').contains('Keluar').click({ force: true });
        cy.wait(1000);

        // Step 9: Mengisi email
        cy.get('input#email').clear().type('approved1@user.com');
        
        // Step 10: Mengisi password
        cy.get('input#password').clear().type('Password@2026');

        // Step 11: Klik tombol "masuk ke akun"
        cy.get('button[type="submit"]').click();

        // Step 12: Pengguna bisa masuk ke halaman dashboard pengguna
        cy.url({ timeout: 15000 }).should('not.include', '/login');

        // Step 13: Klik satu kegiatan yang telah didaftar kan sebelum nya
        cy.visit('/activities');
        cy.contains('Edukasi Pesisir untuk Anak Lombok').click();

        // Verifikasi output: Sistem menampilkan setelah volunteer diterima
        // Progress bar relawan harus menunjukkan "1 dari 15 slot" (atau 1 relawan)
        cy.contains(/1\s*dari\s*15|1 slot|1 relawan/i, { timeout: 10000 }).should('exist');
    });
});
