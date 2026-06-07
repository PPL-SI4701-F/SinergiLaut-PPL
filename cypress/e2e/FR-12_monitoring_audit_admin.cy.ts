describe('FR-12: Monitoring & audit oleh admin', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin');
  });

  it('Harus menampilkan riwayat aksi admin pada tab Audit Log', () => {
    // Navigasi ke halaman Monitoring & Audit
    cy.visit('/admin/monitoring');
    cy.wait(1000); // Hydration wait

    cy.contains('Monitoring & Audit').should('be.visible');
    cy.contains('Riwayat Aksi Admin').should('be.visible');

    // Entri dari tabel reports
    cy.contains('Laporan Bersih Pantai Mutiara').should('be.visible');
    cy.contains('Divalidasi').should('be.visible');

    cy.contains('Laporan Konservasi Terumbu Karang').should('be.visible');
    cy.contains('Ditolak').should('be.visible');

    // Entri dari tabel communities
    cy.contains('Komunitas Mangrove Asri').should('be.visible');
    cy.contains('Disuspend').should('be.visible');

    // Entri dari tabel activities
    cy.contains('Bersih Pantai Mutiara').should('be.visible');
    cy.contains('Dipublikasi').should('be.visible');

    // Entri dari tabel volunteers (registrasi relawan)
    cy.contains('Budi Santoso').should('be.visible');
    cy.contains('Verifikasi Relawan').should('be.visible');
    cy.contains('Disetujui').should('be.visible');
  });

  it('Harus dapat berpindah ke tab Kelola Komunitas', () => {
    cy.visit('/admin/monitoring');
    cy.wait(1000);

    cy.contains('button', 'Kelola Komunitas').click();
    cy.contains('Komunitas Laut Lestari').should('be.visible');
  });
});
