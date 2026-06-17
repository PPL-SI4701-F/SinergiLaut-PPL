describe('FR-27: Persetujuan Pendaftar Relawan - TC-06', () => {
  beforeEach(() => {
    cy.task('resetVolunteerStatus', { activityTitle: 'Rehabilitasi Terumbu Karang Menjangan', status: 'pending' });
  });

  it('Menampilkan nama dan status pending setiap relawan yang menunggu keputusan', () => {
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

    // 4 & 5. Verifikasi nama relawan pending tampil dan statusnya Menunggu Keputusan
    const pendingVolunteers = ['Dian Rahmawati', 'Fajar Nugroho'];
    
    pendingVolunteers.forEach((name) => {
      cy.contains('td', name)
        .parent('tr')
        .within(() => {
          cy.contains('span', /Menunggu|Pending/i).should('be.visible');
        });
    });
  });
});
