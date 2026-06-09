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
  it.skip('Should not show action buttons when disbursement is already completed (Skip: E2E mock for getAllDisbursements is hardcoded to always return a pending disbursement)', () => {
    cy.contains('tr', 'Komunitas Peduli Laut').within(() => {
      cy.get('button').contains(/Proses|Update Status/i).should('not.exist');
      cy.contains(/Ref:/i).should('be.visible');
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
