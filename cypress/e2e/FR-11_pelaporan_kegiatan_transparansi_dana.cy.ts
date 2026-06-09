describe('FR-11: Pelaporan kegiatan & transparansi dana', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');
  });

  it('Harus menampilkan laporan transparansi untuk kegiatan yang telah selesai', () => {
    cy.intercept('GET', '**/rest/v1/activities*', {
      statusCode: 200,
      body: {
        id: 'completed-1',
        title: 'Completed Activity',
        status: 'completed',
        published_at: new Date().toISOString(),
        funding_goal: 10000000,
        funding_raised: 5000000,
        volunteer_quota: 50,
        volunteer_count: 10,
        community: { id: 'com-1', name: 'Com 1', logo_url: null, is_verified: true },
        reports: [
          {
            id: 'report-1',
            activity_id: 'completed-1',
            status: 'validated',
            title: 'Laporan Transparansi Dana',
            summary: 'Laporan penggunaan dana bersih pantai',
            fund_usage: [
              { category: 'Bibit Mangrove', amount: 500000 },
              { category: 'Alat Kebersihan', amount: 200000 },
            ],
            created_at: new Date().toISOString(),
          },
        ],
        feedbacks: [],
        volunteer_registrations: [],
      },
    }).as('getActivity');

    cy.visit('/activities/completed-activity');
    cy.wait('@getActivity');

    // Switch to transparency tab if exists
    cy.contains(/Transparansi|Laporan|Penggunaan Dana/i).click({ force: true });

    // Verify expenses are listed (amounts are rendered via formatCurrency, e.g. "Rp 500.000")
    cy.contains('Bibit Mangrove').should('be.visible');
    cy.contains('Rp 500.000').should('be.visible');
    cy.contains('Alat Kebersihan').should('be.visible');
    cy.contains('Rp 200.000').should('be.visible');

    // Total should be calculated and visible
    cy.contains('Total Penggunaan').should('be.visible');
    cy.contains('Rp 700.000').should('exist');
  });

  it('Harus menampilkan kondisi kosong saat kegiatan selesai belum memiliki laporan', () => {
    cy.intercept('GET', '**/rest/v1/activities*', {
      statusCode: 200,
      body: {
        id: 'completed-no-report',
        title: 'Completed No Report',
        status: 'completed',
        published_at: new Date().toISOString(),
        funding_goal: 5000000,
        funding_raised: 3000000,
        volunteer_quota: 20,
        volunteer_count: 15,
        community: { id: 'com-1', name: 'Com 1', logo_url: null, is_verified: true },
        reports: [],
        feedbacks: [],
        volunteer_registrations: [],
      },
    }).as('getCompletedNoReport');

    cy.visit('/activities/completed-no-report');
    cy.wait('@getCompletedNoReport');

    cy.contains(/Transparansi|Laporan|Penggunaan Dana/i).click({ force: true });

    // Empty state for reports should be displayed
    cy.contains(/belum ada laporan|tidak ada laporan|no report|laporan belum tersedia/i).should(
      'be.visible',
    );
  });

  it('Harus tidak menampilkan item laporan yang belum tervalidasi (status bukan "validated")', () => {
    cy.intercept('GET', '**/rest/v1/activities*', {
      statusCode: 200,
      body: {
        id: 'completed-unvalidated',
        title: 'Completed Unvalidated',
        status: 'completed',
        published_at: new Date().toISOString(),
        funding_goal: 5000000,
        funding_raised: 3000000,
        volunteer_quota: 20,
        volunteer_count: 15,
        community: { id: 'com-1', name: 'Com 1', logo_url: null, is_verified: true },
        reports: [
          {
            id: 'report-unvalidated',
            activity_id: 'completed-unvalidated',
            status: 'submitted', // Not yet validated — must NOT be shown to public
            title: 'Laporan Belum Tervalidasi',
            summary: 'Draft laporan',
            fund_usage: [{ category: 'Item Rahasia', amount: 999999 }],
            created_at: new Date().toISOString(),
          },
        ],
        feedbacks: [],
        volunteer_registrations: [],
      },
    }).as('getUnvalidatedActivity');

    cy.visit('/activities/completed-unvalidated');
    cy.wait('@getUnvalidatedActivity');

    cy.contains(/Transparansi|Laporan|Penggunaan Dana/i).click({ force: true });

    // Unvalidated report items must NOT be visible to the public
    cy.contains('Item Rahasia').should('not.exist');
  });

  it('Harus menghitung total pengeluaran secara akurat dari banyak item laporan', () => {
    cy.intercept('GET', '**/rest/v1/activities*', {
      statusCode: 200,
      body: {
        id: 'completed-multi',
        title: 'Multi Item Report Activity',
        status: 'completed',
        published_at: new Date().toISOString(),
        funding_goal: 10000000,
        funding_raised: 8000000,
        volunteer_quota: 30,
        volunteer_count: 28,
        community: { id: 'com-1', name: 'Com 1', logo_url: null, is_verified: true },
        reports: [
          {
            id: 'report-multi',
            activity_id: 'completed-multi',
            status: 'validated',
            title: 'Laporan Multi Item',
            summary: 'Penggunaan dana lengkap',
            fund_usage: [
              { category: 'Bibit Mangrove', amount: 500000 },
              { category: 'Alat Kebersihan', amount: 200000 },
              { category: 'Konsumsi Relawan', amount: 300000 },
            ],
            created_at: new Date().toISOString(),
          },
        ],
        feedbacks: [],
        volunteer_registrations: [],
      },
    }).as('getMultiActivity');

    cy.visit('/activities/completed-multi');
    cy.wait('@getMultiActivity');

    cy.contains(/Transparansi|Laporan|Penggunaan Dana/i).click({ force: true });

    // All 3 items must be displayed
    cy.contains('Bibit Mangrove').should('be.visible');
    cy.contains('Alat Kebersihan').should('be.visible');
    cy.contains('Konsumsi Relawan').should('be.visible');

    // Total = 500.000 + 200.000 + 300.000 = 1.000.000
    cy.contains('Total Penggunaan').should('be.visible');
    cy.contains('Rp 1.000.000').should('exist');
  });
});
