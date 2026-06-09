describe('FR-04: Verifikasi Akun Komunitas oleh Admin', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin');
  });

  it('Harus menampilkan halaman kelola komunitas dengan daftar komunitas yang menunggu verifikasi', () => {
    cy.visit('/admin/communities');
    cy.wait(1000);

    cy.contains('h1', 'Kelola Komunitas').should('be.visible');
    cy.contains('Menunggu Verifikasi').should('be.visible');
    cy.contains('Eco Ocean').should('be.visible');
    cy.contains('Pending').should('be.visible');
  });

  it('Harus menampilkan tombol Verifikasi dan Tolak pada komunitas yang pending', () => {
    cy.visit('/admin/communities');
    cy.wait(1000);

    cy.contains('Eco Ocean').closest('.rounded-xl').within(() => {
      cy.contains('button', 'Verifikasi').should('be.visible');
      cy.contains('button', 'Tolak').should('be.visible');
    });
  });

  it('Harus berhasil menyetujui komunitas dan menampilkan notifikasi sukses', () => {
    cy.visit('/admin/communities');
    cy.wait(1000);

    cy.contains('Eco Ocean').closest('.rounded-xl').within(() => {
      cy.contains('button', 'Verifikasi').click();
    });

    cy.contains('Komunitas berhasil diverifikasi').should('be.visible');
    cy.contains('Eco Ocean').should('not.exist');
  });

  it('Harus berhasil menolak komunitas dan menampilkan notifikasi info', () => {
    cy.visit('/admin/communities');
    cy.wait(1000);

    cy.contains('Eco Ocean').closest('.rounded-xl').within(() => {
      cy.contains('button', 'Tolak').click();
    });

    cy.get('textarea[placeholder*="Contoh: dokumen"]').type('Data tidak lengkap');
    cy.get('dialog, [role="dialog"]').contains('button', 'Tolak Komunitas').click();

    cy.contains('Komunitas ditolak.').should('be.visible');
  });

  it('Harus menampilkan tabel semua komunitas beserta status verifikasinya', () => {
    cy.visit('/admin/communities');
    cy.wait(1000);

    cy.contains('Semua Komunitas').should('be.visible');
    cy.contains('Komunitas Laut Lestari').should('be.visible');
    cy.contains('Komunitas Mangrove Asri').should('be.visible');
    cy.contains('Komunitas Pesisir Hijau').should('be.visible');
    cy.contains('Terverifikasi').should('be.visible');
    cy.contains('Disuspend').should('be.visible');
  });

  it('Harus dapat mencari komunitas melalui kolom pencarian', () => {
    cy.visit('/admin/communities');
    cy.wait(1000);

    cy.get('input[placeholder="Cari komunitas..."]').type('Mangrove');
    cy.contains('Komunitas Mangrove Asri').should('be.visible');
    cy.contains('Komunitas Laut Lestari').should('not.exist');

    cy.get('input[placeholder="Cari komunitas..."]').clear();
    cy.contains('Komunitas Laut Lestari').should('be.visible');
  });

  it('Harus menampilkan kondisi kosong saat pencarian tidak menghasilkan apa pun', () => {
    cy.visit('/admin/communities');
    cy.wait(1000);

    cy.get('input[placeholder="Cari komunitas..."]').type('xqyzw123nonexistent');
    cy.contains('Tidak ada komunitas ditemukan.').should('be.visible');
  });
});
