describe('FR-17: Riwayat aktivitas pengguna', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');

    cy.intercept('GET', '**/auth/v1/user*', {
      statusCode: 200,
      body: {
        id: 'user-id-1',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'user@example.com',
        user_metadata: { role: 'user', full_name: 'Budi' },
      },
    });
  });

  it('Harus menampilkan riwayat kegiatan di dashboard pengguna', () => {
    cy.setCookie('e2e-bypass-auth', 'user');
    cy.visit(`/user/dashboard?t=${Date.now()}&e2e_user=user`);

    // Wait for the mock data to appear
    cy.contains('Kegiatan Selesai').should('exist');
    cy.contains(/attended|selesai|hadir/i).should('exist');
  });

  it('Harus menampilkan beberapa entri riwayat dengan status pendaftaran yang berbeda-beda', () => {
    cy.setCookie('e2e-bypass-auth', 'user-multi');
    cy.visit(`/user/dashboard?t=${Date.now()}&e2e_user=user-multi`);

    cy.get('#debug-cookie').should('contain', 'user-multi');

    // All 3 activities must appear
    cy.contains('Bersih Pantai Mutiara').should('exist');
    cy.contains('Tanam Mangrove Asri').should('exist');
    cy.contains('Konservasi Terumbu Karang').should('exist');

    // Each distinct status must be rendered
    cy.contains(/attended|selesai|hadir/i).should('exist');
    cy.contains(/approved|diterima|disetujui/i).should('exist');
    cy.contains(/pending|menunggu/i).should('exist');
  });

  it('Harus menampilkan kondisi kosong saat pengguna belum pernah mendaftar kegiatan apa pun', () => {
    cy.setCookie('e2e-bypass-auth', 'user-empty');
    cy.visit(`/user/dashboard?t=${Date.now()}&e2e_user=user-empty`);

    cy.get('#debug-cookie').should('contain', 'user-empty');

    // Empty state message must be shown instead of crashing
    cy.contains(/belum ada|tidak ada|no activity|belum pernah|belum mengikuti/i).should(
      'be.visible',
    );
  });

  it('Harus menampilkan status "ditolak" pada riwayat pendaftaran yang tidak diterima komunitas', () => {
    cy.setCookie('e2e-bypass-auth', 'user-rejected');
    cy.visit(`/user/dashboard?t=${Date.now()}&e2e_user=user-rejected`);

    cy.get('#debug-cookie').should('contain', 'user-rejected');

    cy.contains('Kegiatan Yang Ditolak').should('exist');
    cy.contains(/rejected|ditolak/i).should('exist');
  });
});
