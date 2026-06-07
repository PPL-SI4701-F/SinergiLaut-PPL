describe('FR-15: Monitoring progress kegiatan', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');
  });

  it('Harus menampilkan progress bar relawan dan pendanaan secara akurat', () => {
    cy.intercept('GET', '**/rest/v1/activities?select=*&slug=eq.progress-activity*', {
      statusCode: 200,
      body: [{ 
        id: 'progress-1', 
        title: 'Progress Activity', 
        status: 'published',
        volunteer_quota: 10,
        volunteer_count: 5,
        funding_goal: 5000000,
        funding_raised: 2500000
      }]
    }).as('getActivity');

    cy.visit('/activities/progress-activity');
    cy.wait('@getActivity');

    // Check volunteer progress texts
    cy.contains('5').should('exist');
    cy.contains('10').should('exist');

    // Check funding progress texts
    // Formatting might include Rp or dots
    cy.contains(/2\.?500\.?000/i).should('exist');
    cy.contains(/5\.?000\.?000/i).should('exist');
  });
});
