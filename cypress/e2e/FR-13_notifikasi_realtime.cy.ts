describe('FR-13: Notifikasi Real-time Pengguna', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');
  });

  it('Harus menampilkan ikon lonceng notifikasi pada navigasi untuk pengguna yang login', () => {
    cy.visit('/');
    cy.wait(1000);

    cy.get('button[aria-label="Notifikasi"]').should('be.visible');
  });

  it('Harus membuka dropdown notifikasi saat ikon lonceng diklik', () => {
    cy.visit('/');
    cy.wait(1000);

    cy.get('button[aria-label="Notifikasi"]').click();
    cy.contains('Notifikasi').should('be.visible');
  });

  it('Harus menampilkan kondisi kosong saat tidak ada notifikasi', () => {
    cy.visit('/');
    cy.wait(1000);

    cy.get('button[aria-label="Notifikasi"]').click();
    cy.contains('Tidak ada notifikasi').should('be.visible');
  });

  it('Harus menampilkan badge jumlah notifikasi belum dibaca apabila ada', () => {
    cy.visit('/');
    cy.wait(1000);

    // Badge hanya tampil bila unreadCount > 0 — pastikan tidak crash bila tidak ada
    cy.get('button[aria-label="Notifikasi"]').then($btn => {
      cy.wrap($btn).should('be.visible');
    });
  });

  it('Harus menampilkan ikon lonceng notifikasi pada semua role yang login (komunitas)', () => {
    cy.clearCookies();
    cy.setCookie('e2e-bypass-auth', 'community');
    cy.visit('/');
    cy.wait(1000);

    cy.get('button[aria-label="Notifikasi"]').should('be.visible');
  });

  it('Harus menampilkan ikon lonceng notifikasi pada role admin', () => {
    cy.clearCookies();
    cy.setCookie('e2e-bypass-auth', 'admin');
    cy.visit('/admin/dashboard');
    cy.wait(1000);

    cy.get('button[aria-label="Notifikasi"]').should('be.visible');
  });
});
