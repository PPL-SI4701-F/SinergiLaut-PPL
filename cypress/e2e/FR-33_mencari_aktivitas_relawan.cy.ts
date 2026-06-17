describe('FR-33: Mencari dan Mendaftar Aktivitas Relawan', () => {
  const xssPayload = '<script>alert("xss")</script>';
  const sqlPayload = "' OR 1=1 --";
  const wildcardPayload = '% _ LIKE SELECT DROP';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');

    cy.intercept('GET', '**/rest/v1/activities?*', {
      statusCode: 200,
      body: [
        { id: 'act-1', title: 'Bersih Pantai Mutiara', location: 'Jakarta', category: 'cleanup', type: 'Pembersihan Pantai', start_date: new Date().toISOString(), status: 'published' },
        { id: 'act-2', title: 'Tanam Mangrove', location: 'Bali', category: 'restoration', type: 'Coral & Ecosystem Restoration', start_date: new Date().toISOString(), status: 'published' }
      ]
    }).as('getAllActivities');
  });

  it('Harus mengizinkan pengguna mencari dan menyaring kegiatan menggunakan pencarian teks dan dropdown', () => {
    cy.visit('/activities');
    cy.wait('@getAllActivities');

    // Both should be visible initially
    cy.contains('Bersih Pantai Mutiara').should('be.visible');
    cy.contains('Tanam Mangrove').should('be.visible');

    // 1. Text Search for "Bersih"
    cy.get('input[placeholder*="Cari" i]').type('Bersih');
    cy.contains('Tanam Mangrove').should('not.exist');
    cy.contains('Bersih Pantai Mutiara').should('be.visible');

    // Clear search
    cy.get('input[placeholder*="Cari" i]').clear();
    cy.contains('Tanam Mangrove').should('be.visible');

    // 2. Dropdown Filter: Location filter (Jakarta)
    cy.contains('.act-dropdown-btn', /Location/i).click();
    cy.contains('.act-dropdown-item', 'Jakarta').click();
    cy.contains('Tanam Mangrove').should('not.exist');
    cy.contains('Bersih Pantai Mutiara').should('be.visible');

    // Reset location filter back to "All Locations"
    cy.contains('.act-dropdown-btn', 'Jakarta').click();
    cy.contains('.act-dropdown-item', 'All Locations').click();
    cy.contains('Tanam Mangrove').should('be.visible');

    // 3. Dropdown Filter: Category/Type filter (Restoration)
    cy.contains('.act-dropdown-btn', /Type/i).click();
    cy.contains('.act-dropdown-item', 'Restoration').click();
    cy.contains('Bersih Pantai Mutiara').should('not.exist');
    cy.contains('Tanam Mangrove').should('be.visible');
  });

  // ─────────────────────────────────────────────
  // Edge Case 1: Pencarian dengan karakter SQL Injection
  // ─────────────────────────────────────────────
  it('Harus menangani percobaan SQL injection pada input pencarian dengan aman', () => {
    cy.visit('/activities');
    cy.wait('@getAllActivities');

    cy.get('input[placeholder*="Cari" i]').type(sqlPayload, { delay: 10 });

    // Application must NOT crash or expose internal error
    cy.get('body').should('be.visible');
    cy.contains(/error|exception|syntax error|invalid/i).should('not.exist');

    // No results should show for SQL payload
    cy.contains('Bersih Pantai Mutiara').should('not.exist');
    cy.contains('Tanam Mangrove').should('not.exist');
  });

  // ─────────────────────────────────────────────
  // Edge Case 2: Pencarian dengan XSS payload
  // ─────────────────────────────────────────────
  it('Harus menyaring (sanitize) payload XSS pada kolom pencarian', () => {
    cy.visit('/activities');
    cy.wait('@getAllActivities');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert')
    });

    cy.get('input[placeholder*="Cari" i]').type(xssPayload, { delay: 10 });

    // XSS must NOT execute - verify alert dialog did NOT pop up
    cy.get('body').should('be.visible');
    cy.get('@alert').should('not.have.been.called');
    cy.get('input[placeholder*="Cari" i]').should('have.value', xssPayload);
  });

  // ─────────────────────────────────────────────
  // Edge Case 3: Pencarian wildcard/karakter khusus SQL
  // ─────────────────────────────────────────────
  it('Harus menangani karakter wildcard SQL pada pencarian tanpa crash', () => {
    cy.visit('/activities');
    cy.wait('@getAllActivities');

    cy.get('input[placeholder*="Cari" i]').type(wildcardPayload, { delay: 10 });

    cy.get('body').should('be.visible');
    cy.contains(/error|exception/i).should('not.exist');
  });

  // ─────────────────────────────────────────────
  // Edge Case 4: Pencarian kosong menampilkan semua data
  // ─────────────────────────────────────────────
  it('Harus menampilkan semua kegiatan saat pencarian dikosongkan', () => {
    cy.visit('/activities');
    cy.wait('@getAllActivities');

    const searchInput = cy.get('input[placeholder*="Cari" i]');
    searchInput.type('Bersih');
    cy.contains('Tanam Mangrove').should('not.exist');

    // Clear the search
    cy.get('input[placeholder*="Cari" i]').clear();

    // All activities should be visible again
    cy.contains('Bersih Pantai Mutiara').should('be.visible');
    cy.contains('Tanam Mangrove').should('be.visible');
  });

  // ─────────────────────────────────────────────
  // Edge Case 5: Pencarian keyword random tanpa hasil
  // ─────────────────────────────────────────────
  it('Harus menampilkan kondisi kosong saat pencarian tidak menghasilkan apa pun', () => {
    cy.visit('/activities');
    cy.wait('@getAllActivities');

    cy.get('input[placeholder*="Cari" i]').type('xqyzw123nonexistent');

    // Neither activity should be visible
    cy.contains('Bersih Pantai Mutiara').should('not.exist');
    cy.contains('Tanam Mangrove').should('not.exist');

    // Should show empty/no-result state message
    cy.contains(/tidak ditemukan|tidak ada|no result|belum ada/i).should('be.visible');
  });
});
