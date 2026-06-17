describe('FR-27: Persetujuan Pendaftar Relawan - TC-01', () => {
  beforeEach(() => {
    cy.task('resetVolunteerStatus', { activityTitle: 'Rehabilitasi Terumbu Karang Menjangan', status: 'pending' });
  });

  it('Komunitas dapat menyetujui atau menolak relawan', () => {
    // 1. Login sebagai komunitas
    cy.visit('/login');
    cy.get('input#email').clear().type('owner1@example.com');
    cy.get('input#password').clear().type('Password@2026');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/community/dashboard');

    // 2 & 3. Masuk ke halaman daftar relawan untuk kegiatan "Rehabilitasi Terumbu Karang Menjangan"
    // Find the activity card and click "Kelola Relawan"
    cy.contains('h3', 'Rehabilitasi Terumbu Karang Menjangan')
      .parents('div.rounded-xl') // Go to card container
      .find('a')
      .contains('Kelola Relawan')
      .click({ force: true }); // Use force to bypass any overlay issues

    // 4. Tolak salah satu relawan
    // Cari baris dengan nama Dian Rahmawati
    cy.contains('td', 'Dian Rahmawati')
      .parent('tr')
      .within(() => {
        cy.contains('button', 'Tolak').click();
      });

    // 5. Verifikasi status relawan berubah menjadi ditolak
    cy.contains('td', 'Dian Rahmawati')
      .parent('tr')
      .within(() => {
        cy.contains('span', 'Ditolak').should('be.visible');
      });

    // 6. Setujui relawan lain
    // Cari baris dengan nama Fajar Nugroho
    cy.contains('td', 'Fajar Nugroho')
      .parent('tr')
      .within(() => {
        cy.contains('button', 'Terima').click();
      });

    // Verifikasi status berubah menjadi diterima
    cy.contains('td', 'Fajar Nugroho')
      .parent('tr')
      .within(() => {
        cy.contains('span', 'Disetujui').should('be.visible');
      });
  });
});
