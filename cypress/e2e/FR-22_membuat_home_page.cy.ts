describe('FR-22: Halaman Beranda (Home Page)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('Harus menampilkan hero section dengan judul dan ajakan utama', () => {
    cy.visit('/');
    cy.wait(1000);

    cy.contains('Bersama Jaga').should('be.visible');
    cy.contains('Laut Indonesia').should('be.visible');
    cy.contains('a', 'Lihat Kegiatan').should('have.attr', 'href', '/activities');
    cy.contains('a', 'Daftar Gratis').should('have.attr', 'href', '/register');
  });

  it('Harus menampilkan statistik platform pada hero section', () => {
    cy.visit('/');
    cy.wait(1000);

    cy.contains('Relawan Aktif').should('be.visible');
    cy.contains('Kegiatan Berlangsung').should('be.visible');
    cy.contains('Jumlah Komunitas').should('be.visible');
  });

  it('Harus menampilkan bagian pengantar tentang SinergiLaut dengan tautan ke halaman About', () => {
    cy.visit('/');
    cy.wait(1000);

    cy.contains('Mengenal SinergiLaut Lebih Dekat').should('be.visible');
    cy.contains('a', 'Pelajari Lebih Lanjut').should('have.attr', 'href', '/about');
  });

  it('Harus menampilkan tiga pilar nilai utama platform', () => {
    cy.visit('/');
    cy.wait(1000);

    cy.contains('Dibangun di Atas Tiga Prinsip').should('be.visible');
    cy.contains('100% Transparan').should('be.visible');
    cy.contains('Komunitas Lokal').should('be.visible');
    cy.contains('Dampak Nyata').should('be.visible');
  });

  it('Harus menampilkan bagian kegiatan unggulan atau pesan kosong jika belum ada kegiatan', () => {
    cy.visit('/');
    cy.wait(1000);

    cy.contains('Kegiatan Konservasi Terbaru').should('be.visible');
    cy.get('body').then($body => {
      const hasActivities = $body.find('.sl-act-card').length > 0;
      if (!hasActivities) {
        cy.contains('Belum ada kegiatan yang dipublikasikan.').should('be.visible');
      } else {
        cy.get('.sl-act-card').first().should('be.visible');
      }
    });
  });

  it('Harus menampilkan ajakan untuk bergabung pada bagian penutup', () => {
    cy.visit('/');
    cy.wait(1000);

    cy.contains('Bergabung Sekarang').should('be.visible');
    cy.contains('100% Transparan').should('be.visible');
    cy.contains('Komunitas Terverifikasi').should('be.visible');
    cy.contains('Dampak Nyata').should('be.visible');
    cy.contains('Gratis Bergabung').should('be.visible');
  });

  it('Harus menampilkan navigasi utama dengan tautan Kegiatan, Komunitas, dan Tentang', () => {
    cy.visit('/');
    cy.wait(1000);

    cy.get('header').within(() => {
      cy.contains('a', 'Kegiatan').should('have.attr', 'href', '/activities');
      cy.contains('a', 'Komunitas').should('have.attr', 'href', '/community');
      cy.contains('a', 'Tentang').should('have.attr', 'href', '/about');
    });
  });

  it('Harus menampilkan tombol Masuk dan Daftar untuk pengunjung yang belum login', () => {
    cy.visit('/');
    cy.wait(1000);

    cy.get('header').within(() => {
      cy.contains('a', 'Masuk').should('have.attr', 'href', '/login');
      cy.contains('a', 'Daftar').should('have.attr', 'href', '/register');
    });
  });
});
