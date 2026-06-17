describe('FR-27: Persetujuan Pendaftar Relawan - TC-04', () => {
  beforeEach(() => {
    cy.task('resetVolunteerStatus', { activityTitle: 'Rehabilitasi Terumbu Karang Menjangan', status: 'pending' });
  });

  it('Komunitas dapat menolak relawan pending', () => {
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

    // 4. Klik tombol Tolak pada relawan pending
    cy.contains('td', 'Fajar Nugroho')
      .parent('tr')
      .within(() => {
        cy.contains('button', 'Tolak').click();
      });

    // 5. Verifikasi status berubah menjadi ditolak
    cy.contains('td', 'Fajar Nugroho')
      .parent('tr')
      .within(() => {
        cy.contains('span', 'Ditolak').should('be.visible');
      });
  });
});
