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

    cy.contains('Riwayat Aktivitas Admin').should('be.visible');
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


    // Sidebar uses Link with label "Komunitas"
    cy.contains('Komunitas').click({ force: true });
    cy.contains('Kelola Komunitas').should('be.visible'); // page title in /admin/communities
  });
});

describe('FR-12: Verifikasi Pengguna (/admin/users)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin');
    cy.visit('/admin/users');
    cy.wait(1000);
  });

  it('Harus menampilkan daftar pengguna dengan filter tab dan kolom pencarian', () => {
    cy.contains('Semua').should('be.visible');
    cy.contains('Menunggu').should('be.visible');
    cy.contains('Disetujui').should('be.visible');
    cy.contains('Ditolak').should('be.visible');
    cy.get('input[placeholder*="Cari"]').should('be.visible');
  });

  it('Harus dapat mengekspansi detail pengguna pending dan melihat opsi', () => {
    cy.contains('button', 'Menunggu').first().click();
    cy.wait(500);
    // Asumsi ada baris/kartu data user dengan badge Menunggu
    cy.get('.border-yellow-300').first().find('button').first().click({ force: true });
    cy.contains('Setujui Verifikasi').should('be.visible');
    cy.contains('Tolak').should('be.visible');
  });

  it('Harus dapat menolak verifikasi pengguna', () => {
    cy.contains('button', 'Menunggu').first().click();
    cy.wait(500);
    cy.get('.border-yellow-300').first().find('button').first().click({ force: true });
    cy.contains('Tolak').click();
    
    // Dialog penolakan muncul, cari textarea alasan
    cy.get('textarea').type('Data tidak valid');
    cy.contains('button', 'Konfirmasi').click();
  });
});

describe('FR-12: Manajemen Laporan (/admin/reports)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin');
    cy.visit('/admin/reports');
    cy.wait(1000);
  });

  it('Harus menampilkan tabel laporan dengan kolom yang sesuai', () => {
    cy.contains('th', 'Laporan').should('be.visible');
    cy.contains('th', 'Komunitas').should('be.visible');
    cy.contains('th', 'Tanggal').should('be.visible');
    cy.contains('th', 'Status').should('be.visible');
    cy.contains('th', 'Aksi').should('be.visible');
  });

  it('Harus dapat melakukan pencarian laporan', () => {
    cy.get('input[placeholder*="Cari"]').type('Bersih Pantai');
    cy.wait(500);
  });
});

describe('FR-12: Kelola Konten Journey (/admin/journey)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin');
    cy.visit('/admin/journey');
    cy.wait(1000);
  });

  it('Harus menampilkan daftar milestone Perjalanan Kami', () => {
    cy.contains('Kelola Perjalanan Kami').should('be.visible');
    cy.contains('Tambah Milestone').should('be.visible');
  });

  it('Harus dapat membuka form Tambah Milestone', () => {
    cy.contains('Tambah Milestone').click();
    // Cek field form
    cy.contains('Tahun').should('be.visible');
    cy.contains('Judul').should('be.visible');
    cy.contains('Deskripsi').should('be.visible');
  });
});

describe('FR-12: Sanksi Komunitas (/admin/communities)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin');
    cy.visit('/admin/communities');
    cy.wait(1000);
  });

  it('Harus menampilkan tabel komunitas dan pencarian', () => {
    cy.contains('Kelola Komunitas').should('be.visible');
    cy.get('input[placeholder*="Cari"]').should('be.visible');
  });

  it('Harus dapat memunculkan dropdown aksi dan modal Beri Sanksi', () => {
    // Cari tombol titik tiga atau aksi di baris pertama
    cy.get('table').find('button').first().click({ force: true });
    cy.contains('Beri Sanksi').click();
    
    // Verifikasi modal
    cy.contains('Peringatan').should('be.visible');
    cy.contains('Suspend').should('be.visible');
    cy.contains('Ban Permanen').should('be.visible');
  });
});
