describe('FR-19: Dashboard Komunitas', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'community');
  });

  it('Harus menampilkan halaman dashboard komunitas dengan judul dan status terverifikasi', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('h1', 'Dashboard Komunitas').should('be.visible');
    cy.contains('Komunitas Terverifikasi').should('be.visible');
    cy.contains('Kelola kegiatan, relawan, dan laporan komunitas Anda').should('be.visible');
  });

  it('Harus menampilkan kartu statistik komunitas', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Total Kegiatan').should('be.visible');
    cy.contains('Total Relawan').should('be.visible');
    cy.contains('Total Donasi').should('be.visible');
    cy.contains('Laporan Terverifikasi').should('be.visible');

    // Mock stats: totalActivities=2, totalVolunteers=15, verifiedReports="1/2"
    cy.contains('Total Kegiatan').parents('.p-5').within(() => {
      cy.contains('2').should('be.visible');
    });
    cy.contains('Total Relawan').parents('.p-5').within(() => {
      cy.contains('15').should('be.visible');
    });
    cy.contains('Laporan Terverifikasi').parents('.p-5').within(() => {
      cy.contains('1/2').should('be.visible');
    });
  });

  it('Harus menampilkan daftar kegiatan komunitas pada bagian Kelola Kegiatan', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Kelola Kegiatan').should('be.visible');
    cy.contains('Katalog kegiatan komunitas Anda').should('be.visible');
    cy.contains('Bersih Pantai Mutiara').should('be.visible');
    cy.contains('Aktif').should('be.visible');
  });

  it('Harus menyediakan tombol Buat Kegiatan menuju halaman pembuatan kegiatan', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('a', 'Buat Kegiatan').should('have.attr', 'href', '/community/dashboard/activities/create');
  });

  it('Harus dapat mencari kegiatan komunitas melalui kolom pencarian', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.get('input[placeholder="Cari kegiatan..."]').type('Bersih');
    cy.contains('Bersih Pantai Mutiara').should('be.visible');

    cy.get('input[placeholder="Cari kegiatan..."]').clear().type('xqyzw123nonexistent');
    cy.contains('Bersih Pantai Mutiara').should('not.exist');
  });

  it('Harus menampilkan tombol Kelola dan Edit pada setiap kartu kegiatan', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Bersih Pantai Mutiara').parents('.border-border').within(() => {
      cy.contains('a', 'Kelola').should('have.attr', 'href').and('include', '/volunteers');
      cy.contains('button', /Ajukan Edit/i).should('be.visible');
    });
  });
});
