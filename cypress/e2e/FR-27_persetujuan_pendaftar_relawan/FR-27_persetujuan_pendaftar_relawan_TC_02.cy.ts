describe('FR-27: Persetujuan Pendaftar Relawan - TC-02', () => {
  beforeEach(() => {
    
    // Pastikan user terdaftar sebagai relawan (status pending)
    cy.task('registerVolunteer', { email: 'approved1@user.com', activityTitle: 'Edukasi Pesisir untuk Anak Lombok' });
  });

  it('Komunitas dapat menyetujui relawan', () => {
    // 1. Akses menu login
    cy.visit('/login');

    // 2. Mengisi email owner2 (pemilik kegiatan)
    cy.get('input#email').clear().type('owner2@example.com');

    // 3. Mengisi password
    cy.get('input#password').clear().type('Password@2026');

    // 4. Klik tombol "masuk ke akun"
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // 5. Pengguna bisa masuk ke halaman dashboard komunitas
    cy.contains('Edukasi Pesisir untuk Anak Lombok').should('be.visible');

    // 6. Pencet tombol kelola pada kegiatan
    cy.contains('Edukasi Pesisir untuk Anak Lombok')
      .parents('div.rounded-xl') // Go to card container
      .find('a')
      .contains('Kelola')
      .click({ force: true });
    
    // 7. Pencet tombol "terima" pada relawan "Muhamad Habibi Budiman"
    cy.contains('.rounded-xl', 'Muhamad Habibi Budiman')
      .within(() => {
        cy.contains('button', 'Terima').click();
      });

    // Verifikasi status berubah menjadi Diterima
    cy.contains('.rounded-xl', 'Muhamad Habibi Budiman')
      .within(() => {
        cy.contains('span', 'Diterima').should('be.visible');
      });
  });
});
