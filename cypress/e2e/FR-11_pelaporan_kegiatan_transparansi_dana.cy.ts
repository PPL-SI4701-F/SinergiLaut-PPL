describe('FR-11: Pelaporan kegiatan & transparansi dana', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');
  });

  it('Harus menampilkan laporan transparansi untuk kegiatan yang telah selesai', () => {
    cy.intercept('GET', '**/rest/v1/activities?*', {
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
        reports: [{
          id: 'report-1',
          activity_id: 'completed-1',
          status: 'validated',
          title: 'Laporan Transparansi Dana',
          summary: 'Laporan penggunaan dana bersih pantai',
          fund_usage: [
            { item: 'Bibit Mangrove', amount: 500000 },
            { item: 'Alat Kebersihan', amount: 200000 }
          ],
          created_at: new Date().toISOString()
        }],
        feedbacks: [],
        volunteer_registrations: []
      }
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
});
