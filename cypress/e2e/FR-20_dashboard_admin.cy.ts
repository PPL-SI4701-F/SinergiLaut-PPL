describe('FR-20: Dashboard Admin', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin');
  });

  // =====================================================
  // HEADER
  // =====================================================

  it('Harus menampilkan header dashboard dengan judul dan deskripsi ringkasan platform', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('h1', 'Admin Dashboard').should('be.visible');
    cy.contains('Ringkasan aktivitas platform SinergiLaut').should('be.visible');
  });

  // =====================================================
  // KARTU STATISTIK UTAMA
  // =====================================================

  it('Harus menampilkan semua 4 kartu statistik platform', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Total Komunitas').should('be.visible');
    cy.contains('Pengguna Aktif').should('be.visible');
    cy.contains('Kegiatan Aktif').should('be.visible');
    cy.contains('Total Donasi Terkumpul').should('be.visible');
  });

  it('Harus menampilkan nilai statistik yang sesuai data mock', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    // totalCommunities: 5
    cy.contains('Total Komunitas').parents('.p-5').within(() => {
      cy.contains('5').should('be.visible');
    });

    // totalUsers: 10
    cy.contains('Pengguna Aktif').parents('.p-5').within(() => {
      cy.contains('10').should('be.visible');
    });

    // totalActivities: 5
    cy.contains('Kegiatan Aktif').parents('.p-5').within(() => {
      cy.contains('5').should('be.visible');
    });
  });

  it('Harus menampilkan label "Data terbaru" pada setiap kartu statistik', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Total Komunitas').parents('.p-5').within(() => {
      cy.contains('Data terbaru').should('be.visible');
    });
    cy.contains('Pengguna Aktif').parents('.p-5').within(() => {
      cy.contains('Data terbaru').should('be.visible');
    });
  });

  // =====================================================
  // KARTU RINGKASAN PENDING (ALERT CARDS)
  // =====================================================

  it('Harus menampilkan 4 kartu alert ringkasan item pending', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Menunggu verifikasi').should('be.visible');
    cy.contains('Menunggu persetujuan').should('be.visible');
    cy.contains('Menunggu validasi').should('be.visible');
    cy.contains('Menunggu verifikasi data diri').should('be.visible');
  });

  it('Harus menampilkan jumlah item pending yang benar pada alert cards', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    // 1 komunitas pending
    cy.contains('1 komunitas').should('be.visible');
    // 2 kegiatan pending
    cy.contains('2 kegiatan').should('be.visible');
    // 1 laporan pending
    cy.contains('1 laporan').should('be.visible');
  });

  it('Harus mengarahkan ke halaman kelola komunitas saat alert card komunitas diklik', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    // Cari link <a href="/admin/communities"> yang mengandung teks "Menunggu verifikasi"
    cy.contains('a[href="/admin/communities"]', 'Menunggu verifikasi').should('be.visible');
  });

  it('Harus mengarahkan ke halaman kelola kegiatan saat alert card kegiatan diklik', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('a[href="/admin/activities"]', 'Menunggu persetujuan').should('be.visible');
  });

  it('Harus mengarahkan ke halaman laporan saat alert card laporan diklik', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('a[href="/admin/reports"]', 'Menunggu validasi').should('be.visible');
  });

  it('Harus mengarahkan ke halaman pengguna saat alert card pengguna diklik', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('a[href="/admin/users"]', 'Menunggu verifikasi data diri').should('be.visible');
  });

  // =====================================================
  // SECTION KOMUNITAS PENDING
  // =====================================================

  it('Harus menampilkan section Komunitas Pending dengan deskripsi dan data mock', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Komunitas Pending').should('be.visible');
    cy.contains('Perlu tindakan admin').should('be.visible');
    cy.contains('Eco Ocean').should('be.visible');
  });

  it('Harus menampilkan tombol Setujui pada setiap komunitas pending', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Eco Ocean').closest('.rounded-lg').within(() => {
      cy.contains('button', 'Setujui').should('be.visible');
    });
  });

  it('Harus menampilkan tombol Tolak (link X) yang mengarah ke halaman kelola komunitas', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Eco Ocean').closest('.rounded-lg').within(() => {
      cy.get('a[href="/admin/communities"]').should('exist');
    });
  });

  it('Harus berhasil menyetujui komunitas dan menampilkan notifikasi sukses', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Eco Ocean').closest('.rounded-lg').within(() => {
      cy.contains('button', 'Setujui').click();
    });

    cy.contains('Komunitas berhasil disetujui').should('be.visible');
  });

  it('Setelah disetujui, komunitas harus hilang dari daftar Komunitas Pending', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Eco Ocean').closest('.rounded-lg').within(() => {
      cy.contains('button', 'Setujui').click();
    });

    // Setelah satu-satunya komunitas pending disetujui, section menampilkan empty state
    // (Eco Ocean masih muncul di Kegiatan Pending sebagai nama komunitas, jadi cek spesifik)
    cy.contains('Tidak ada yang pending.').should('be.visible');
  });

  it('Harus menampilkan tombol "Lihat Semua" komunitas dengan href /admin/communities', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Komunitas Pending').parents('[class*="rounded"]').first()
      .find('a[href="/admin/communities"]').should('exist');
  });

  // =====================================================
  // SECTION KEGIATAN PENDING
  // =====================================================

  it('Harus menampilkan section Kegiatan Pending dengan deskripsi dan data mock', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Kegiatan Pending').should('be.visible');
    cy.contains('Menunggu moderasi').should('be.visible');
    cy.contains('Pending Activity 1').should('be.visible');
    cy.contains('Pending Activity 2').should('be.visible');
  });

  it('Harus menampilkan nama komunitas pada setiap kartu kegiatan pending', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Pending Activity 1').closest('.rounded-lg').within(() => {
      cy.contains('Eco Ocean').should('be.visible');
    });
  });

  it('Harus menampilkan tombol Review pada setiap kegiatan pending', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Pending Activity 1').closest('.rounded-lg').within(() => {
      cy.contains('a', 'Review')
        .should('have.attr', 'href')
        .and('include', '/admin/activities/')
        .and('include', '/review');
    });
  });

  it('Harus menampilkan tombol Setujui (ikon centang hijau) pada setiap kegiatan pending', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Pending Activity 1').closest('.rounded-lg').within(() => {
      cy.get('button.bg-green-600').should('exist');
    });
  });

  it('Harus menampilkan tombol Tolak (ikon X merah) pada setiap kegiatan pending', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Pending Activity 1').closest('.rounded-lg').within(() => {
      cy.get('button[class*="bg-destructive"]').should('exist');
    });
  });

  it('Harus berhasil menyetujui kegiatan dan menampilkan notifikasi sukses', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Pending Activity 1').closest('.rounded-lg').within(() => {
      cy.get('button.bg-green-600').click();
    });

    cy.contains('Kegiatan berhasil disetujui').should('be.visible');
  });

  it('Setelah disetujui, kegiatan harus hilang dari daftar pending', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Pending Activity 1').should('be.visible');
    cy.contains('Pending Activity 1').closest('.rounded-lg').within(() => {
      cy.get('button.bg-green-600').click();
    });

    cy.contains('Pending Activity 1').should('not.exist');
  });

  it('Harus berhasil menolak kegiatan dan menampilkan notifikasi', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Pending Activity 1').closest('.rounded-lg').within(() => {
      cy.get('button[class*="bg-destructive"]').click();
    });

    cy.contains('Kegiatan ditolak').should('be.visible');
  });

  it('Setelah ditolak, kegiatan harus hilang dari daftar pending', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Pending Activity 1').should('be.visible');
    cy.contains('Pending Activity 1').closest('.rounded-lg').within(() => {
      cy.get('button[class*="bg-destructive"]').click();
    });

    cy.contains('Pending Activity 1').should('not.exist');
  });

  it('Harus menampilkan tombol "Lihat Semua" kegiatan dengan href /admin/activities', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Kegiatan Pending').parents('[class*="rounded"]').first()
      .find('a[href="/admin/activities"]').should('exist');
  });

  // =====================================================
  // SECTION LAPORAN PENDING
  // =====================================================

  it('Harus menampilkan section Laporan Pending dengan deskripsi dan data mock', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Laporan Pending').should('be.visible');
    cy.contains('Menunggu validasi admin').should('be.visible');
    cy.contains('Pembersihan Pantai').should('be.visible');
  });

  it('Harus menampilkan tombol "Lihat Semua" laporan dengan href /admin/reports', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Laporan Pending').parents('[class*="rounded"]').first()
      .find('a[href="/admin/reports"]').should('exist');
  });

  // =====================================================
  // SECTION VERIFIKASI PENGGUNA
  // =====================================================

  it('Harus menampilkan section Verifikasi Pengguna dengan deskripsi', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Verifikasi Pengguna').should('be.visible');
    cy.contains('Data diri perlu diverifikasi').should('be.visible');
    cy.contains('pengguna menunggu verifikasi data diri').should('be.visible');
  });

  it('Harus menampilkan tombol "Lihat Semua" pengguna dengan href /admin/users', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Verifikasi Pengguna').parents('[class*="rounded"]').first()
      .find('a[href="/admin/users"]').should('exist');
  });

  // =====================================================
  // STATE KOSONG (ADMIN-EMPTY)
  // =====================================================

  it('Harus menampilkan state kosong "Tidak ada yang pending." saat tidak ada komunitas pending', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin-empty');
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Komunitas Pending').should('be.visible');
    cy.contains('Tidak ada yang pending.').should('be.visible');
  });

  it('Harus menampilkan state kosong "Tidak ada yang pending." saat tidak ada kegiatan pending', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin-empty');
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Kegiatan Pending').should('be.visible');
    cy.contains('Tidak ada yang pending.').should('be.visible');
  });

  it('Harus menampilkan state kosong saat tidak ada laporan pending', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin-empty');
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Laporan Pending').should('be.visible');
    cy.contains('Tidak ada laporan pending.').should('be.visible');
  });

  it('Harus tetap menampilkan halaman tanpa error saat semua data pending kosong', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin-empty');
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Admin Dashboard').should('be.visible');
    cy.get('main').should('exist');
    cy.get('[class*="error"]').should('not.exist');
  });

  // =====================================================
  // NAVIGASI
  // =====================================================

  it('Harus dapat berpindah ke halaman kelola komunitas lewat link "Lihat Semua"', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Komunitas Pending').parents('[class*="rounded"]').first()
      .find('a[href="/admin/communities"]').first().click();
    cy.url().should('include', '/admin/communities');
  });

  it('Harus dapat berpindah ke halaman laporan lewat link "Lihat Semua" laporan', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Laporan Pending').parents('[class*="rounded"]').first()
      .find('a[href="/admin/reports"]').click();
    cy.url().should('include', '/admin/reports');
  });

  it('Harus dapat berpindah ke halaman review kegiatan saat tombol Review diklik', () => {
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.contains('Pending Activity 1').closest('.rounded-lg').within(() => {
      cy.contains('a', 'Review').click();
    });

    cy.url().should('include', '/admin/activities');
    cy.url().should('include', '/review');
  });

  // =====================================================
  // KONTROL AKSES
  // =====================================================

  it('Harus redirect ke /unauthorized jika mengakses dengan role community', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'community');

    cy.visit('/admin/dashboard');
    cy.url().should('include', '/unauthorized');
  });

  it('Harus redirect ke /unauthorized jika mengakses dengan role user', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');

    cy.visit('/admin/dashboard');
    cy.url().should('include', '/unauthorized');
  });

  it('Harus redirect ke halaman login jika mengakses tanpa autentikasi', () => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit('/admin/dashboard');
    cy.url().should('include', '/login');
  });
});
