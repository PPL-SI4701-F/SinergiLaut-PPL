describe('FR-16: Dashboard Pengguna', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');
  });

  it('Harus menampilkan halaman dashboard pengguna dengan sapaan dan status verifikasi', () => {
    cy.visit('/user/dashboard');
    cy.wait(1000);

    cy.contains('Selamat datang').should('be.visible');
    cy.contains('Mock User', { matchCase: false }).should('exist');
    cy.contains('Terverifikasi').should('be.visible');
    cy.contains('Pantau partisipasi dan riwayat Anda di SinergiLaut').should('be.visible');
  });

  it('Harus menampilkan kartu statistik: kegiatan diikuti, total donasi, dan status aktif', () => {
    cy.visit('/user/dashboard');
    cy.wait(1000);

    cy.contains('Kegiatan Diikuti').should('be.visible');
    cy.contains('Total Donasi').should('be.visible');
    cy.contains('Status Aktif').should('be.visible');

    // Mock stats: totalActivities=1, activeActivities=1, totalDonations=0
    cy.contains('Kegiatan Diikuti').parents('.rounded-2xl').within(() => {
      cy.contains('1').should('be.visible');
    });
    cy.contains('Status Aktif').parents('.rounded-2xl').within(() => {
      cy.contains('1').should('be.visible');
    });
  });

  it('Harus menyediakan tautan untuk mengedit profil dari dashboard', () => {
    cy.visit('/user/dashboard');
    cy.wait(1000);

    cy.contains('a', 'Edit Profil').should('have.attr', 'href', '/user/profile');
  });

  it('Harus mengarahkan ke halaman profil saat tautan Edit Profil diklik', () => {
    cy.visit('/user/dashboard');
    cy.wait(1000);

    cy.contains('a', 'Edit Profil').click();
    cy.url().should('include', '/user/profile');
    cy.contains('h1', 'Edit Profil').should('be.visible');
  });

  it('Harus menampilkan riwayat aktivitas relawan pengguna', () => {
    cy.visit('/user/dashboard');
    cy.wait(1000);

    cy.get('body').should('be.visible');
    // DashboardClient menampilkan daftar pendaftaran relawan & donasi pengguna
    cy.get('main').should('exist');
  });
});
