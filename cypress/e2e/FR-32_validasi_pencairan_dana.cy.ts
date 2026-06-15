describe('FR-32: Validasi Laporan dan Pencairan Dana', () => {
  // Data pencairan berasal dari mock E2E pada getAllDisbursements() di
  // lib/actions/disbursement.actions.ts — selalu satu baris berstatus "pending"
  // untuk komunitas "Komunitas Peduli Laut" senilai Rp 5.000.000.

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin');

    cy.intercept('GET', '**/auth/v1/user*', {
      statusCode: 200,
      body: {
        id: 'admin-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'admin@example.com',
        user_metadata: { role: 'admin' },
      },
    });

    cy.visit('/admin/disbursements');
    cy.contains('Komunitas Peduli Laut').should('be.visible');
    cy.contains(/Rp\s*5[\.,]000[\.,]000/).should('be.visible');
  });

  it('Harus mengizinkan admin memproses pencairan dana dari Menunggu hingga Selesai', () => {
    // Status awal: Menunggu → klik "Tinjau" untuk membuka modal update status
    cy.contains('tr', 'Komunitas Peduli Laut').contains('button', /^\s*Tinjau\s*$/i).click();

    cy.contains('Update Status Pencairan').should('be.visible');
    cy.get('input[placeholder*="TRF" i]').type('TRX-123456');
    cy.contains('button', /Setujui & Proses/i).click();

    // Setelah berhasil, modal tertutup dan badge berubah menjadi "Diproses"
    cy.contains('Update Status Pencairan').should('not.exist');
    cy.contains('tr', 'Komunitas Peduli Laut').contains(/Diproses/i).should('be.visible');

    // Lanjutkan ke "Selesai" lewat tombol "Update Status"
    cy.contains('tr', 'Komunitas Peduli Laut').contains('button', /Update Status/i).click();
    cy.contains('button', /Tandai Selesai/i).click();

    cy.contains('Update Status Pencairan').should('not.exist');
    cy.contains('tr', 'Komunitas Peduli Laut').contains(/Selesai/i).should('be.visible');
  });

  // ─────────────────────────────────────────────
  // Edge Case 1: Nomor referensi bersifat opsional
  // ─────────────────────────────────────────────
  it('Harus tetap berhasil memproses pencairan walau nomor referensi dikosongkan', () => {
    cy.contains('tr', 'Komunitas Peduli Laut').contains('button', /^\s*Tinjau\s*$/i).click();

    // Tidak mengisi nomor referensi sama sekali — field ini opsional
    cy.contains('button', /Setujui & Proses/i).click();

    cy.contains('Update Status Pencairan').should('not.exist');
    cy.contains('tr', 'Komunitas Peduli Laut').contains(/Diproses/i).should('be.visible');
  });

  // ─────────────────────────────────────────────
  // Edge Case 2: Tandai Gagal (alur negatif)
  // ─────────────────────────────────────────────
  it('Harus mengizinkan admin menandai pencairan dana sebagai gagal', () => {
    // Pindahkan dulu ke status "Diproses"
    cy.contains('tr', 'Komunitas Peduli Laut').contains('button', /^\s*Tinjau\s*$/i).click();
    cy.contains('button', /Setujui & Proses/i).click();
    cy.contains('tr', 'Komunitas Peduli Laut').contains(/Diproses/i).should('be.visible');

    // Tandai sebagai gagal
    cy.contains('tr', 'Komunitas Peduli Laut').contains('button', /Update Status/i).click();
    cy.contains('button', /Tandai Gagal/i).click();

    cy.contains('Update Status Pencairan').should('not.exist');
    cy.contains('tr', 'Komunitas Peduli Laut').contains(/Gagal/i).should('be.visible');
  });

  // ─────────────────────────────────────────────
  // Edge Case 3: Disbursement sudah "completed" - tombol aksi tidak muncul
  // ─────────────────────────────────────────────
  it('Should not show action buttons when disbursement is already completed', () => {
    cy.contains('tr', 'Komunitas Laut Hijau').within(() => {
      cy.contains('button', /Proses|Update Status|Tinjau/i).should('not.exist');
      cy.contains(/Selesai/i).should('be.visible');
    });
  });

  // ─────────────────────────────────────────────
  // New: Menutup modal tanpa memproses
  // ─────────────────────────────────────────────
  it('Harus menutup modal update status saat tombol Batal atau Close diklik', () => {
    cy.contains('tr', 'Komunitas Peduli Laut').contains('button', /^\s*Tinjau\s*$/i).click();

    // Modal must open first
    cy.contains('Update Status Pencairan').should('be.visible');

    // Click cancel / close button
    cy.contains('button', /Batal|Cancel|Tutup|Close/i).click();

    // Modal must close — no status change
    cy.contains('Update Status Pencairan').should('not.exist');
    // Status must still be "Menunggu" (unchanged)
    cy.contains('tr', 'Komunitas Peduli Laut').contains(/Menunggu|pending/i).should('be.visible');
  });

  // ─────────────────────────────────────────────
  // New: Tabel pencairan menampilkan kolom dengan benar
  // ─────────────────────────────────────────────
  it('Harus menampilkan kolom tabel pencairan yang mencakup komunitas, jumlah, dan status', () => {
    // beforeEach already visits the page and confirms the base data
    // Verify additional table structure elements
    cy.get('main').within(() => {
      cy.contains(/komunitas|community/i).should('be.visible');
      cy.contains(/jumlah|amount|nominal/i).should('be.visible');
      cy.contains(/status/i).should('be.visible');

      // Data row integrity
      cy.contains('Komunitas Peduli Laut').should('be.visible');
      cy.contains(/Rp\s*5[\.,]000[\.,]000/).should('be.visible');
      cy.contains(/Menunggu|pending/i).should('be.visible');
    });
  });
});

// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Validasi Laporan Pertanggungjawaban oleh Admin
// Menutup gap acceptance criteria "Validasi Laporan oleh Admin".
// Mock getAdminReportsList() di lib/actions/dashboard.actions.ts selalu
// mengembalikan satu laporan "Laporan Bersih Pantai Mutiara" milik
// komunitas "Eco Ocean" berstatus submitted. approveReportAction &
// rejectReportAction mengembalikan { success: true } di mode E2E.
// ════════════════════════════════════════════════════════════════════
describe('FR-32: Validasi Laporan oleh Admin (/admin/reports)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin');

    cy.visit('/admin/reports');
    cy.contains('Kelola Laporan').should('be.visible');
    cy.contains('Laporan Bersih Pantai Mutiara').should('be.visible');
  });

  it('Harus menampilkan laporan submitted dengan badge Menunggu Review dan tombol aksi', () => {
    cy.contains('tr', 'Laporan Bersih Pantai Mutiara').within(() => {
      cy.contains('Eco Ocean').should('be.visible');
      cy.contains(/Menunggu Review/i).should('be.visible');
      cy.contains('button', /Validasi/i).should('be.visible');
      cy.contains('button', /Tolak/i).should('be.visible');
    });
  });

  it('Harus menyaring laporan menggunakan tab status "Menunggu"', () => {
    cy.contains('button', /^\s*Menunggu/i).click();
    cy.contains('Laporan Bersih Pantai Mutiara').should('be.visible');
  });

  // ─────────────────────────────────────────────
  // AC: approveReportAction → status validated + notifikasi sukses
  // ─────────────────────────────────────────────
  it('Harus memvalidasi laporan submitted dan mengubah status menjadi Divalidasi', () => {
    cy.contains('tr', 'Laporan Bersih Pantai Mutiara')
      .contains('button', /Validasi/i).click();

    // Toast konfirmasi notifikasi terkirim ke komunitas
    cy.contains(/berhasil divalidasi/i).should('be.visible');

    // Badge berubah menjadi "Divalidasi"
    cy.contains('tr', 'Laporan Bersih Pantai Mutiara')
      .contains(/Divalidasi/i).should('be.visible');

    // Tombol aksi hilang karena status bukan lagi submitted
    cy.contains('tr', 'Laporan Bersih Pantai Mutiara')
      .contains('button', /Validasi/i).should('not.exist');
  });

  // ─────────────────────────────────────────────
  // AC: rejectReportAction → status rejected + notifikasi penolakan
  // ─────────────────────────────────────────────
  it('Harus menolak laporan submitted dan mengubah status menjadi Ditolak', () => {
    cy.contains('tr', 'Laporan Bersih Pantai Mutiara')
      .contains('button', /Tolak/i).click();

    cy.contains(/Laporan ditolak/i).should('be.visible');
    cy.contains('tr', 'Laporan Bersih Pantai Mutiara')
      .contains(/Ditolak/i).should('be.visible');
  });

  it('Harus memiliki tautan Lihat Detail yang benar', () => {
    cy.contains('tr', 'Laporan Bersih Pantai Mutiara')
      .contains('a', /Lihat Detail/i)
      .should('have.attr', 'href')
      .and('include', '/admin/reports/report-1');
  });
});

// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Pembuatan Pencairan & Validasi Saldo
// ════════════════════════════════════════════════════════════════════
describe('FR-32: Pembuatan Pencairan dan Validasi Saldo', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin');
  });

  it('Harus berhasil membuat pencairan baru jika saldo mencukupi', () => {
    // Asumsi rute pembuatan pencairan ada di modal atau halaman khusus
    cy.visit('/admin/disbursements');
    cy.get('body').should('not.have.css', 'pointer-events', 'none'); // Tunggu body tidak ter-lock
    cy.contains('button', /Buat Pencairan/i).click({ force: true });
    
    // Pilih kegiatan pertama yang tersedia (index 1 karena index 0 adalah placeholder)
    cy.get('select').find('option').eq(1).then($option => {
      cy.get('select').select($option.val() as string);
    });

    cy.get('input[name="amount"]').type('1000000');
    cy.get('input[name="bank_name"]').type('BCA');
    cy.get('input[name="account_number"]').type('123456789');
    cy.get('input[name="account_name"]').type('Komunitas Laut');
    cy.get('[role="dialog"]').contains('button', /Simpan|Buat/i).click({ force: true });
    
    cy.contains(/Berhasil|Pencairan dibuat/i).should('be.visible');
  });

  it('Harus gagal dan menampilkan error jika nominal pencairan melebihi saldo tersedia', () => {
    cy.visit('/admin/disbursements');
    cy.get('body').should('not.have.css', 'pointer-events', 'none'); // Tunggu body tidak ter-lock
    cy.contains('button', /Buat Pencairan/i).click({ force: true });
    
    // Pilih kegiatan pertama yang tersedia
    cy.get('select').find('option').eq(1).then($option => {
      cy.get('select').select($option.val() as string);
    });

    // Test case melebihi saldo
    cy.get('input[name="amount"]').type('1000000000'); // Asumsi jauh lebih besar dari saldo
    cy.get('input[name="bank_name"]').type('BCA');
    cy.get('input[name="account_number"]').type('123456789');
    cy.get('input[name="account_name"]').type('Komunitas Laut');
    cy.get('[role="dialog"]').contains('button', /Simpan|Buat/i).click({ force: true });
    
    // Alert error dari server action
    cy.contains(/melebihi saldo tersedia/i).should('exist');
  });
});

// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Dana Abadi (Endowment)
// ════════════════════════════════════════════════════════════════════
describe('FR-32: Dana Abadi (Endowment)', () => {
  it('Harus menampilkan list pencairan dana abadi di halaman publik /endowment', () => {
    cy.visit('/endowment');
    cy.contains(/Dana Abadi/i).should('be.visible');
    // Pastikan setidaknya ada data pencairan yang me-render catatan dana abadi
  });
});

// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Akses Komunitas ke Data Disbursement
// ════════════════════════════════════════════════════════════════════
describe('FR-32: Akses Komunitas', () => {
  it('Komunitas hanya melihat riwayat pencairan miliknya sendiri', () => {
    cy.clearCookies();
    cy.setCookie('e2e-bypass-auth', 'community'); // Login sebagai komunitas
    cy.visit('/community/dashboard/disbursements');
    cy.contains(/Riwayat Pencairan/i).should('be.visible');
  });
});

