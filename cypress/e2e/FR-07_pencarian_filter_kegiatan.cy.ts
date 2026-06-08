describe('FR-07: Pencarian dan Filter Kegiatan', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');

    cy.intercept('GET', '**/rest/v1/activities?select=*&status=eq.published*', {
      statusCode: 200,
      body: [
        { id: 'act-1', title: 'Bersih Pantai Mutiara', location: 'Jakarta', category: 'cleanup', start_date: new Date().toISOString() },
        { id: 'act-2', title: 'Tanam Mangrove Asri', location: 'Bali', category: 'restoration', start_date: new Date().toISOString() },
        { id: 'act-3', title: 'Konservasi Terumbu Karang', location: 'Bali', category: 'restoration', start_date: new Date().toISOString() }
      ]
    }).as('getAllActivities');
  });

  it('Harus menampilkan halaman kegiatan dengan kolom pencarian dan dropdown filter', () => {
    cy.visit('/activities');
    cy.wait('@getAllActivities');

    cy.get('input[placeholder*="Cari" i]').should('be.visible');
    cy.contains('.act-dropdown-btn', /Location/i).should('be.visible');
    cy.contains('.act-dropdown-btn', /Type/i).should('be.visible');

    cy.contains('Bersih Pantai Mutiara').should('be.visible');
    cy.contains('Tanam Mangrove Asri').should('be.visible');
    cy.contains('Konservasi Terumbu Karang').should('be.visible');
  });

  it('Harus dapat menyaring kegiatan berdasarkan lokasi melalui dropdown', () => {
    cy.visit('/activities');
    cy.wait('@getAllActivities');

    cy.contains('.act-dropdown-btn', /Location/i).click();
    cy.contains('.act-dropdown-item', 'Bali').click();

    cy.contains('Bersih Pantai Mutiara').should('not.exist');
    cy.contains('Tanam Mangrove Asri').should('be.visible');
    cy.contains('Konservasi Terumbu Karang').should('be.visible');
  });

  it('Harus dapat menyaring kegiatan berdasarkan tipe/kategori melalui dropdown', () => {
    cy.visit('/activities');
    cy.wait('@getAllActivities');

    cy.contains('.act-dropdown-btn', /Type/i).click();
    cy.contains('.act-dropdown-item', 'Coral & Ecosystem Restoration').click();

    cy.contains('Bersih Pantai Mutiara').should('not.exist');
    cy.contains('Tanam Mangrove Asri').should('be.visible');
    cy.contains('Konservasi Terumbu Karang').should('be.visible');
  });

  it('Harus dapat menggabungkan pencarian teks dengan filter dropdown', () => {
    cy.visit('/activities');
    cy.wait('@getAllActivities');

    cy.contains('.act-dropdown-btn', /Location/i).click();
    cy.contains('.act-dropdown-item', 'Bali').click();

    cy.get('input[placeholder*="Cari" i]').type('Mangrove');

    cy.contains('Tanam Mangrove Asri').should('be.visible');
    cy.contains('Konservasi Terumbu Karang').should('not.exist');
    cy.contains('Bersih Pantai Mutiara').should('not.exist');
  });

  it('Harus dapat mereset filter kembali ke kondisi semula', () => {
    cy.visit('/activities');
    cy.wait('@getAllActivities');

    cy.contains('.act-dropdown-btn', /Location/i).click();
    cy.contains('.act-dropdown-item', 'Jakarta').click();
    cy.contains('Tanam Mangrove Asri').should('not.exist');

    cy.contains('.act-dropdown-btn', 'Jakarta').click();
    cy.contains('.act-dropdown-item', 'All Locations').click();

    cy.contains('Bersih Pantai Mutiara').should('be.visible');
    cy.contains('Tanam Mangrove Asri').should('be.visible');
    cy.contains('Konservasi Terumbu Karang').should('be.visible');
  });

  it('Harus menampilkan kondisi kosong saat kombinasi filter tidak menghasilkan kegiatan', () => {
    cy.visit('/activities');
    cy.wait('@getAllActivities');

    cy.contains('.act-dropdown-btn', /Location/i).click();
    cy.contains('.act-dropdown-item', 'Jakarta').click();

    cy.contains('.act-dropdown-btn', /Type/i).click();
    cy.contains('.act-dropdown-item', 'Coral & Ecosystem Restoration').click();

    cy.contains('Bersih Pantai Mutiara').should('not.exist');
    cy.contains('Tanam Mangrove Asri').should('not.exist');
    cy.contains(/tidak ditemukan|tidak ada|no result|belum ada/i).should('be.visible');
  });
});
