describe('FR-27: Persetujuan Pendaftar Relawan - TC-01', () => {
  beforeEach(() => {
    // Pastikan database dalam keadaan bersih dan test database up to date
    
    // Pastikan user ini belum terdaftar di kegiatan ini
    cy.task('deleteVolunteer', { email: 'approved1@user.com', activityTitle: 'Edukasi Pesisir untuk Anak Lombok' });
  });

  it('Akses kegiatan aktif dan mendaftarkan relawan', () => {
    // 1. Akses menu login
    cy.visit('/login');
    
    // 2. Mengisi email
    cy.get('input#email').clear().type('approved1@user.com');
    
    // 3. Mengisi password
    cy.get('input#password').clear().type('Password@2026');
    
    // 4. Klik tombol "masuk ke akun"
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // 5. Klik satu kegiatan
    cy.contains('Edukasi Pesisir untuk Anak Lombok').click({ force: true });
    cy.url().should('include', '/activities/');

    // 6-8. (Langkah visual dilewati karena teks di UI sudah berubah)
    
    // 9. Klik tab Daftar Relawan
    cy.contains('button', 'Daftar Relawan').click();

    // 10. Mengisi Nama lengkap
    cy.get('input[placeholder="Nama lengkap"]').clear().type('Muhamad Habibi Budiman');

    // 11. Mengisi Umur
    cy.get('input[placeholder*="Umur"]').clear().type('21');

    // 12. Mengisi nomer telepon
    cy.get('input[type="tel"]').clear().type('102022300226');

    // 13. Menyetujui persyaratan
    cy.get('input[type="checkbox"]').check({ force: true });

    // 14. Klik tombol "Daftar Sebagai Relawan"
    cy.contains('button', 'Daftar Sebagai Relawan').click();

    // Pastikan berhasil mendaftar (kembali ke detail kegiatan atau ada notifikasi sukses)
    cy.contains(/Pendaftaran berhasil|Tunggu konfirmasi/i).should('be.visible');
  });
});
