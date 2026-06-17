describe('FR-27: Persetujuan Pendaftar Relawan - TC-02', () => {
  

  it('Sistem memblokir persetujuan saat kuota relawan penuh', () => {
    // 1. Login sebagai komunitas
    cy.visit('/login');
    cy.get('input#email').clear().type('owner2@example.com');
    cy.get('input#password').clear().type('Password@2026');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/community/dashboard');

    // 2 & 3. Masuk ke halaman daftar relawan kegiatan
    cy.contains('h3', 'Transplantasi Karang Takabonerate')
      .parents('div.rounded-xl')
      .find('a')
      .contains('Kelola Relawan')
      .click({ force: true });

    // 4. Verifikasi kuota kegiatan penuh
    // Asumsikan di UI ada indikator "1 dari 1 slot" atau "1 / 1"
    cy.contains(/1\s*(dari|\/)\s*1\s*(slot|relawan)?/i).should('exist');

    // 5. Verifikasi tombol setujui relawan disabled
    // Mencari tombol "Terima" pada baris relawan pending dan memverifikasi bahwa tombol tersebut disabled
    // Cari baris dengan status "Menunggu Keputusan" atau tombol "Terima"
    cy.get('button:contains("Terima")').each(($btn) => {
      cy.wrap($btn).should('be.disabled');
    });
  });
});
