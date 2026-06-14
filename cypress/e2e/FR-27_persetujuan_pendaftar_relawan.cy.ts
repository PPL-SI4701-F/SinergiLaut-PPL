describe('FR-27: Persetujuan Pendaftar Relawan', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'community');

    cy.intercept('GET', '**/auth/v1/user*', {
      statusCode: 200,
      body: {
        id: 'community-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'community@example.com',
        user_metadata: { role: 'community' },
      },
    });
  });

  it('Harus mengizinkan komunitas menyetujui atau menolak relawan', () => {
    cy.visit('/community/dashboard/activities/act-1/volunteers');
    cy.wait(1000);

    // Action Reject
    cy.contains('Budi').parents('div.border, tr, .card, li').find('button').contains(/Tolak|Reject/i).click();
    cy.wait(500); // Wait for optimistic update or mock
    cy.contains('Budi').parents('div.border').contains(/Ditolak|Rejected/i).should('be.visible');

    // Action Approve
    cy.contains('Ani').parents('div.border, tr, .card, li').find('button').contains(/Terima|Approve|Setujui/i).click();
    cy.wait(500); // Wait for optimistic update or mock
  });

  // ─────────────────────────────────────────────
  // Edge Case 1: Kuota penuh - Setujui relawan ke-51
  // ─────────────────────────────────────────────
  it('Should block approval when volunteer quota is already full', () => {
    cy.visit('/community/dashboard/activities/act-full/volunteers');
    
    // Wait for the mock activity data to load on the page.
    // If this times out, it means the server mock did not return 50/50 for act-full!
    cy.contains('50/50', { timeout: 15000 }).should('be.visible');

    // Wait for the volunteer data to load
    cy.contains('Budi', { timeout: 15000 }).should('be.visible');

    // The button must now be disabled because isQuotaFull is true
    cy.contains('Budi')
      .parents('div.border, tr, .card, li')
      .contains('button', /Terima|Approve|Setujui/i)
      .should('be.disabled');
  });

  // ─────────────────────────────────────────────
  // Edge Case 2: Kuota tersedia - Persetujuan normal berhasil
  // ─────────────────────────────────────────────
  it('Should allow approval when volunteer quota has space available', () => {
    cy.visit('/community/dashboard/activities/act-1/volunteers');
    cy.wait(1000);

    cy.contains('Budi')
      .parents('div.border, tr, .card, li')
      .find('button')
      .contains(/Terima|Approve|Setujui/i)
      .click();

    cy.wait(500);
    cy.contains('Budi').parents('div.border, tr, .card, li').contains(/Diterima|Approved|Disetujui/i).should('be.visible');
  });

  // ─────────────────────────────────────────────
  // Edge Case 3: Penolakan relawan (negative path)
  // ─────────────────────────────────────────────
  it('Should allow rejection of a pending volunteer', () => {
    cy.visit('/community/dashboard/activities/act-1/volunteers');
    cy.wait(1000);

    cy.contains('Ani')
      .parents('div.border, tr, .card, li')
      .find('button')
      .contains(/Tolak|Reject/i)
      .click();

    cy.wait(500);
    cy.contains('Ani').parents('div.border, tr, .card, li').contains(/Ditolak|Rejected/i).should('be.visible');
  });

  // ─────────────────────────────────────────────
  // Edge Case 4: Daftar relawan kosong (zero state)
  // Override beforeEach intercept di dalam test untuk mengembalikan array kosong
  // ─────────────────────────────────────────────
  it('Harus menampilkan empty state saat tidak ada relawan yang mendaftar', () => {
    cy.setCookie('e2e-bypass-auth', 'community-empty');
    cy.visit('/community/dashboard/activities/act-1/volunteers');
    cy.wait(1000);

    // Should show zero-state UI, not crash
    cy.get('main').contains(/belum ada|tidak ada|no volunteer|kosong|empty/i).should('be.visible');
  });

  // ─────────────────────────────────────────────
  // New: Detail relawan pending tampil lengkap
  // ─────────────────────────────────────────────
  it('Harus menampilkan nama dan status "pending" setiap relawan yang menunggu keputusan', () => {
    cy.visit('/community/dashboard/activities/act-1/volunteers');
    cy.wait(1000);

    cy.contains('Budi').should('be.visible');
    cy.contains('Ani').should('be.visible');
    cy.contains(/pending|menunggu/i).should('be.visible');
  });

  // ─────────────────────────────────────────────
  // New: Tombol aksi tersedia untuk setiap relawan pending
  // ─────────────────────────────────────────────
  it('Harus menampilkan tombol Terima dan Tolak untuk setiap relawan yang masih berstatus pending', () => {
    cy.visit('/community/dashboard/activities/act-1/volunteers');
    cy.wait(1000);

    // Both action buttons must be available for the first pending volunteer
    cy.contains('Budi')
      .parents('div.border, tr, .card, li')
      .first()
      .within(() => {
        cy.contains(/Terima|Approve|Setujui/i).should('be.visible');
        cy.contains(/Tolak|Reject/i).should('be.visible');
      });
  });
});
