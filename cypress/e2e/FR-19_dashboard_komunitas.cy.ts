describe('FR-19: Dashboard Komunitas', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'community');
  });

  // =====================================================
  // HEADER & STATUS VERIFIKASI
  // =====================================================

  it('Harus menampilkan header dashboard dengan judul, deskripsi, dan status komunitas terverifikasi', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('h1', 'Dashboard Komunitas').should('be.visible');
    cy.contains('Komunitas Terverifikasi').should('be.visible');
    cy.contains('Kelola kegiatan, relawan, dan laporan komunitas Anda').should('be.visible');
  });

  // =====================================================
  // KARTU STATISTIK
  // =====================================================

  it('Harus menampilkan semua 5 kartu statistik komunitas', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Total Kegiatan').should('be.visible');
    cy.contains('Total Relawan').should('be.visible');
    cy.contains('Total Donasi').should('be.visible');
    cy.contains('Total Saldo Komunitas').should('be.visible');
    cy.contains('Laporan Terverifikasi').should('be.visible');
  });

  it('Harus menampilkan nilai statistik yang sesuai data mock', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    // totalActivities: 2
    cy.contains('Total Kegiatan').parents('.p-5').within(() => {
      cy.contains('2').should('be.visible');
    });

    // totalVolunteers: 15
    cy.contains('Total Relawan').parents('.p-5').within(() => {
      cy.contains('15').should('be.visible');
    });

    // verifiedReports: "1/2"
    cy.contains('Laporan Terverifikasi').parents('.p-5').within(() => {
      cy.contains('1/2').should('be.visible');
    });
  });

  it('Harus menampilkan sub-informasi rincian kegiatan pada kartu Total Kegiatan', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Total Kegiatan').parents('.p-5').within(() => {
      cy.contains('terlaksana').should('be.visible');
      cy.contains('aktif').should('be.visible');
      cy.contains('menunggu verifikasi').should('be.visible');
    });
  });

  it('Harus menampilkan sub-informasi relawan aktif pada kartu Total Relawan', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Total Relawan').parents('.p-5').within(() => {
      cy.contains('relawan kegiatan aktif').should('be.visible');
    });
  });

  it('Harus menampilkan label "Data terbaru" pada kartu statistik', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Total Kegiatan').parents('.p-5').within(() => {
      cy.contains('Data terbaru').should('be.visible');
    });
    cy.contains('Total Relawan').parents('.p-5').within(() => {
      cy.contains('Data terbaru').should('be.visible');
    });
  });

  // =====================================================
  // SECTION KELOLA KEGIATAN - HEADER & TOMBOL
  // =====================================================

  it('Harus menampilkan section Kelola Kegiatan dengan judul dan deskripsi', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Kelola Kegiatan').should('be.visible');
    cy.contains('Katalog kegiatan komunitas Anda').should('be.visible');
  });

  it('Harus menampilkan tombol Buat Kegiatan dengan href yang benar', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    // Scope ke main untuk menghindari link yang sama di sidebar yang tersembunyi
    cy.get('main').contains('a', 'Buat Kegiatan')
      .should('have.attr', 'href', '/community/dashboard/activities/create');
  });

  it('Harus mengarahkan ke halaman buat kegiatan saat tombol Buat Kegiatan diklik', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    // Scope ke main untuk menghindari link di sidebar yang tersembunyi (display:none)
    cy.get('main').contains('a', 'Buat Kegiatan').click();
    cy.url().should('include', '/community/dashboard/activities/create');
  });

  // =====================================================
  // DAFTAR KEGIATAN - SEMUA STATUS
  // =====================================================

  it('Harus menampilkan semua kegiatan mock dengan berbagai status', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Bersih Pantai Mutiara').should('be.visible');
    cy.contains('Konservasi Mangrove Cilincing').should('be.visible');
    cy.contains('Pemantauan Koral Kepulauan Seribu').should('be.visible');
    cy.contains('Restorasi Ekosistem Pantai Kramat').should('be.visible');
    cy.contains('Tanam Mangrove Pulau Tidung').should('be.visible');
  });

  it('Harus menampilkan badge status yang sesuai pada setiap kartu kegiatan', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Bersih Pantai Mutiara').parents('.border-border').within(() => {
      cy.contains('Aktif').should('be.visible');
    });
    cy.contains('Konservasi Mangrove Cilincing').parents('.border-border').within(() => {
      cy.contains('Draft').should('be.visible');
    });
    cy.contains('Pemantauan Koral Kepulauan Seribu').parents('.border-border').within(() => {
      cy.contains('Menunggu Review').should('be.visible');
    });
    cy.contains('Restorasi Ekosistem Pantai Kramat').parents('.border-border').within(() => {
      cy.contains('Selesai').should('be.visible');
    });
    cy.contains('Tanam Mangrove Pulau Tidung').parents('.border-border').within(() => {
      cy.contains('Dibatalkan').should('be.visible');
    });
  });

  it('Harus menampilkan informasi jumlah relawan dan donasi pada kartu kegiatan', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Bersih Pantai Mutiara').parents('.border-border').within(() => {
      cy.contains(/\d+\/\d+\s*relawan/).should('be.visible');
    });
  });

  // =====================================================
  // TOMBOL AKSI PER KARTU KEGIATAN
  // =====================================================

  it('Harus menampilkan tombol Kelola dengan href menuju halaman volunteers', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Bersih Pantai Mutiara').parents('.border-border').within(() => {
      cy.contains('a', 'Kelola')
        .should('have.attr', 'href')
        .and('include', '/volunteers');
    });
  });

  it('Harus menampilkan tombol Edit (link langsung ke /edit) untuk kegiatan berstatus Draft', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Konservasi Mangrove Cilincing').parents('.border-border').within(() => {
      cy.contains('a', 'Edit')
        .should('have.attr', 'href')
        .and('include', '/edit');
    });
  });

  it('Harus menampilkan tombol Ajukan Edit untuk kegiatan berstatus Aktif', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Bersih Pantai Mutiara').parents('.border-border').within(() => {
      cy.contains('button', /Ajukan Edit/i).should('be.visible');
    });
  });

  it('Harus membuka dialog Ajukan Edit saat tombol diklik pada kegiatan Aktif', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Bersih Pantai Mutiara').parents('.border-border').within(() => {
      cy.contains('button', /Ajukan Edit/i).click();
    });

    cy.contains('Ajukan Edit Kegiatan').should('be.visible');
    cy.get('textarea[placeholder="Tuliskan alasan pengajuan edit..."]').should('be.visible');
    cy.contains('button', 'Kirim Pengajuan').should('be.visible');
  });

  it('Harus menutup dialog Ajukan Edit saat tombol Batal diklik', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Bersih Pantai Mutiara').parents('.border-border').within(() => {
      cy.contains('button', /Ajukan Edit/i).click();
    });

    cy.contains('Ajukan Edit Kegiatan').should('be.visible');
    // Scope ke dalam dialog untuk menghindari pencocokan dengan tombol "Batalkan" di latar
    cy.get('[role="dialog"]').contains('button', 'Batal').click();
    cy.contains('Ajukan Edit Kegiatan').should('not.exist');
  });

  it('Harus menampilkan tombol Upload/Lihat Laporan untuk kegiatan berstatus Selesai', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Restorasi Ekosistem Pantai Kramat').parents('.border-border').within(() => {
      cy.contains('a', /Upload Laporan|Lihat Laporan/)
        .should('have.attr', 'href')
        .and('include', '/report');
    });
  });

  it('Harus menampilkan tombol Batalkan untuk kegiatan berstatus Menunggu Review', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Pemantauan Koral Kepulauan Seribu').parents('.border-border').within(() => {
      cy.contains('button', 'Batalkan').should('be.visible');
    });
  });

  it('Harus menampilkan tombol Hapus untuk kegiatan berstatus Dibatalkan', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Tanam Mangrove Pulau Tidung').parents('.border-border').within(() => {
      cy.contains('button', 'Hapus').should('be.visible');
    });
  });

  // =====================================================
  // FITUR PENCARIAN
  // =====================================================

  it('Harus menampilkan input pencarian di section Kelola Kegiatan', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.get('input[placeholder="Cari kegiatan..."]').should('be.visible');
  });

  it('Harus memfilter kegiatan sesuai kata kunci yang diketik', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.get('input[placeholder="Cari kegiatan..."]').type('Bersih');

    cy.contains('Bersih Pantai Mutiara').should('be.visible');
    cy.contains('Konservasi Mangrove Cilincing').should('not.exist');
    cy.contains('Pemantauan Koral Kepulauan Seribu').should('not.exist');
    cy.contains('Restorasi Ekosistem Pantai Kramat').should('not.exist');
  });

  it('Harus menampilkan pesan "Tidak ada kegiatan ditemukan." saat pencarian tidak cocok', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.get('input[placeholder="Cari kegiatan..."]').type('xqyzw123nonexistent');
    cy.contains('Tidak ada kegiatan ditemukan.').should('be.visible');
  });

  it('Harus menampilkan kembali semua kegiatan setelah kolom pencarian dikosongkan', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.get('input[placeholder="Cari kegiatan..."]').type('Bersih');
    cy.contains('Konservasi Mangrove Cilincing').should('not.exist');

    cy.get('input[placeholder="Cari kegiatan..."]').clear();
    cy.contains('Bersih Pantai Mutiara').should('be.visible');
    cy.contains('Konservasi Mangrove Cilincing').should('be.visible');
  });

  it('Harus pencarian bersifat case-insensitive', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.get('input[placeholder="Cari kegiatan..."]').type('bersih');
    cy.contains('Bersih Pantai Mutiara').should('be.visible');
  });

  // =====================================================
  // FITUR FILTER STATUS
  // =====================================================

  it('Harus menampilkan dropdown filter status dengan nilai default "Semua Status"', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.get('[role="combobox"]').should('be.visible').and('contain.text', 'Semua Status');
  });

  it('Harus memfilter kegiatan berdasarkan status Aktif', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.get('[role="combobox"]').click();
    cy.contains('[role="option"]', 'Aktif').click();

    cy.contains('Bersih Pantai Mutiara').should('be.visible');
    cy.contains('Konservasi Mangrove Cilincing').should('not.exist');
    cy.contains('Pemantauan Koral Kepulauan Seribu').should('not.exist');
    cy.contains('Restorasi Ekosistem Pantai Kramat').should('not.exist');
  });

  it('Harus memfilter kegiatan berdasarkan status Menunggu Review', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.get('[role="combobox"]').click();
    cy.contains('[role="option"]', 'Menunggu Review').click();

    cy.contains('Pemantauan Koral Kepulauan Seribu').should('be.visible');
    cy.contains('Bersih Pantai Mutiara').should('not.exist');
  });

  it('Harus memfilter kegiatan berdasarkan status Selesai', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.get('[role="combobox"]').click();
    cy.contains('[role="option"]', 'Selesai').click();

    cy.contains('Restorasi Ekosistem Pantai Kramat').should('be.visible');
    cy.contains('Bersih Pantai Mutiara').should('not.exist');
  });

  it('Harus memfilter kegiatan berdasarkan status Dibatalkan', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.get('[role="combobox"]').click();
    cy.contains('[role="option"]', 'Dibatalkan').click();

    cy.contains('Tanam Mangrove Pulau Tidung').should('be.visible');
    cy.contains('Bersih Pantai Mutiara').should('not.exist');
  });

  it('Harus menampilkan "Tidak ada kegiatan ditemukan." saat filter status tidak ada hasilnya', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    // Tidak ada kegiatan dengan status "Sedang Berlangsung" di mock data
    cy.get('[role="combobox"]').click();
    cy.contains('[role="option"]', 'Sedang Berlangsung').click();

    cy.contains('Tidak ada kegiatan ditemukan.').should('be.visible');
  });

  it('Harus menampilkan kembali semua kegiatan saat filter direset ke Semua Status', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.get('[role="combobox"]').click();
    cy.contains('[role="option"]', 'Aktif').click();
    cy.contains('Konservasi Mangrove Cilincing').should('not.exist');

    cy.get('[role="combobox"]').click();
    cy.contains('[role="option"]', 'Semua Status').click();

    cy.contains('Bersih Pantai Mutiara').should('be.visible');
    cy.contains('Konservasi Mangrove Cilincing').should('be.visible');
  });

  // =====================================================
  // KOMBINASI PENCARIAN + FILTER
  // =====================================================

  it('Harus menggabungkan pencarian teks dan filter status secara bersamaan', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    // Filter ke Aktif, lalu cari kata kunci yang tidak ada di kegiatan Aktif
    cy.get('[role="combobox"]').click();
    cy.contains('[role="option"]', 'Aktif').click();

    cy.get('input[placeholder="Cari kegiatan..."]').type('Bersih');
    cy.contains('Bersih Pantai Mutiara').should('be.visible');

    cy.get('input[placeholder="Cari kegiatan..."]').clear().type('Mangrove');
    cy.contains('Tidak ada kegiatan ditemukan.').should('be.visible');
  });

  // =====================================================
  // KONTROL AKSES
  // =====================================================

  it('Harus redirect ke /unauthorized jika mengakses dengan role user', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');

    cy.visit('/community/dashboard');
    cy.url().should('include', '/unauthorized');
  });

  it('Harus redirect ke /unauthorized jika mengakses dengan role admin', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin');

    cy.visit('/community/dashboard');
    cy.url().should('not.include', '/community/dashboard');
  });

  it('Harus redirect ke halaman login jika mengakses tanpa autentikasi', () => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit('/community/dashboard');
    cy.url().should('include', '/login');
  });
});
