describe('FR-27: Persetujuan Pendaftar Relawan - TC-03', () => {
  beforeEach(() => {
    cy.task('resetVolunteerStatus', { activityTitle: 'Rehabilitasi Terumbu Karang Menjangan', status: 'pending' });
  });

  it('Komunitas dapat menyetujui relawan saat kuota masih tersedia', () => {
    // 1. Login sebagai komunitas
    cy.visit('/login');
    cy.get('input#email').clear().type('owner1@example.com');
    cy.get('input#password').clear().type('Password@2026');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/community/dashboard');

    // 2 & 3. Masuk ke halaman daftar relawan
    cy.contains('h3', 'Rehabilitasi Terumbu Karang Menjangan')
      .parents('div.rounded-xl')
      .find('a')
      .contains('Kelola Relawan')
      .click({ force: true });

    // 4. Klik tombol Terima/Setujui pada relawan pending
    cy.contains('td', 'Dian Rahmawati')
      .parent('tr')
      .within(() => {
        cy.contains('button', 'Terima').click();
      });

    // 5. Verifikasi status berubah menjadi diterima
    cy.contains('td', 'Dian Rahmawati')
      .parent('tr')
      .within(() => {
        cy.contains('span', 'Disetujui').should('be.visible');
      });
  });
});
