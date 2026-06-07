describe('FR-10: Manajemen batas waktu donasi', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');
  });

  it('Harus mengizinkan donasi jika batas waktu (end_date) masih di masa depan', () => {
    const futureDate = new Date(); // Today, deadline will be 6 months in future

    cy.intercept('GET', '**/rest/v1/activities?*', {
      statusCode: 200,
      body: { 
        id: 'active-activity', 
        title: 'Active Activity', 
        status: 'published',
        published_at: futureDate.toISOString(),
        funding_goal: 10000000,
        funding_raised: 5000000,
        volunteer_quota: 50,
        volunteer_count: 10,
        community: { id: 'com-1', name: 'Com 1', logo_url: null, is_verified: true },
        reports: [],
        feedbacks: [],
        volunteer_registrations: []
      }
    }).as('getActiveActivity');

    cy.visit('/activities/active-activity');
    cy.wait('@getActiveActivity');

    // The donation form/button should exist and be enabled
    cy.contains('button', /Donasi/i).should('not.be.disabled');
  });

  it('Harus memblokir donasi jika batas waktu (end_date) sudah lewat', () => {
    // Mock an expired activity (published 7 months ago)
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 7);

    cy.intercept('GET', '**/rest/v1/activities?*', {
      statusCode: 200,
      body: { 
        id: 'expired-activity', 
        title: 'Expired Activity', 
        status: 'published',
        published_at: pastDate.toISOString(),
        funding_goal: 10000000,
        funding_raised: 5000000,
        volunteer_quota: 50,
        volunteer_count: 10,
        community: { id: 'com-1', name: 'Com 1', logo_url: null, is_verified: true },
        reports: [],
        feedbacks: [],
        volunteer_registrations: []
      }
    }).as('getExpiredActivity');

    cy.visit('/activities/expired-activity');
    cy.wait('@getExpiredActivity');

    // The donation button should be disabled and show warning
    cy.contains('button', /Batas Waktu Habis/i).should('be.disabled');
    cy.contains(/Batas waktu pengumpulan habis/i).should('exist');
  });
});
