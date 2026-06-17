describe('FR-27: Persetujuan Pendaftar Relawan - TC-05', () => {
  

  it('Menampilkan empty state saat tidak ada relawan yang mendaftar', () => {
    // 1. Login sebagai komunitas (menggunakan owner2 karena kegiatan ini milik owner2)
    cy.visit('/login');
    cy.get('input#email').clear().type('owner2@example.com');
    cy.get('input#password').clear().type('Password@2026');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/community/dashboard');

    // 2 & 3. Masuk ke halaman daftar relawan
    cy.contains('h3', 'Edukasi Pesisir untuk Anak Lombok')
      .parents('div.rounded-xl')
      .find('a')
      .contains('Kelola Relawan')
      .click({ force: true });

    // 4. Verifikasi halaman tidak crash (sudah tercover dari bisa load halaman)
    cy.url().should('include', '/volunteers');

    // 5. Verifikasi pesan empty state tampil
    cy.contains(/Belum ada relawan yang terdaftar|Tidak ada data/i).should('be.visible');
  });
});
