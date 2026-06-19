describe('FR-27: Persetujuan Pendaftar Relawan - TC-04', () => {
  beforeEach(() => {
    
    // Precondition: Kegiatan selesai dan volunteer sudah di acc (approved)
    cy.task('updateActivityStatus', { activityTitle: 'Edukasi Pesisir untuk Anak Lombok', status: 'completed' });
    cy.task('registerVolunteer', { email: 'approved1@user.com', activityTitle: 'Edukasi Pesisir untuk Anak Lombok' });
    cy.task('approveVolunteer', { email: 'approved1@user.com', activityTitle: 'Edukasi Pesisir untuk Anak Lombok' });
  });

  it('Komunitas dapat menghadirkan volunteer kegiatan', () => {
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
    
    // 7 & 8. Pencet tombol hadir pada "Muhamad Habibi Budiman" dan masukan bukti kehadiran
    cy.contains('.rounded-xl', 'Muhamad Habibi Budiman')
      .within(() => {
        cy.contains('button', 'Tandai Hadir').click();
      });

    // Asumsi: muncul modal atau form untuk upload bukti
    // Modal exists outside the list, so we don't use .within() here
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test.png', { force: true });
    
    // Asumsi: ada tombol submit/simpan untuk bukti kehadiran
    cy.get('button').contains(/Konfirmasi Hadir/i).click();

    // Verifikasi status berubah menjadi Hadir (Attended / Hadir)
    cy.contains('.rounded-xl', 'Muhamad Habibi Budiman')
      .within(() => {
        cy.contains('span', /Hadir/i).should('be.visible');
      });
  });
});
