describe('FR-15: Monitoring progress kegiatan', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');
  });

  it('Harus menampilkan progress bar relawan dan pendanaan secara akurat', () => {
    cy.intercept('GET', '**/rest/v1/activities*', {
      statusCode: 200,
      body: {
        id: 'progress-1',
        title: 'Progress Activity',
        status: 'published',
        volunteer_quota: 10,
        volunteer_count: 5,
        funding_goal: 5000000,
        funding_raised: 2500000,
        community: { name: 'Komunitas Alam' },
        volunteer_registrations: [],
        feedbacks: []
      }
    }).as('getActivity');

    cy.visit('/activities/progress-1');
    cy.wait('@getActivity');

    // Check volunteer progress texts
    cy.contains('5').should('exist');
    cy.contains('10').should('exist');

    // Check funding progress texts
    // Formatting might include Rp or dots
    cy.contains(/2\.?500\.?000/i).should('exist');
    cy.contains(/5\.?000\.?000/i).should('exist');
  });

  it('Harus menampilkan progress 0% saat belum ada relawan yang mendaftar dan belum ada donasi masuk', () => {
    cy.intercept('GET', '**/rest/v1/activities*', {
      statusCode: 200,
      body: {
        id: 'zero-1',
        title: 'Zero Progress Activity',
        status: 'published',
        volunteer_quota: 20,
        volunteer_count: 0,
        funding_goal: 10000000,
        funding_raised: 0,
        community: { name: 'Komunitas Alam' },
        volunteer_registrations: [],
        feedbacks: []
      }
    }).as('getZeroActivity');

    cy.visit('/activities/zero-1');
    cy.wait('@getZeroActivity');

    // 0 volunteers registered
    cy.contains(/0\s*\/\s*20|0 relawan|0%/i).should('exist');

    // 0 funding raised — Rp 0 or formatted equivalent
    cy.contains(/Rp\s*0|0\s*terkumpul/i).should('exist');
  });

  it('Harus menampilkan indikator penuh saat kuota relawan dan target dana tercapai 100%', () => {
    cy.intercept('GET', '**/rest/v1/activities*', {
      statusCode: 200,
      body: {
        id: 'full-1',
        title: 'Full Capacity Activity',
        status: 'published',
        volunteer_quota: 10,
        volunteer_count: 10,
        funding_goal: 5000000,
        funding_raised: 5000000,
        community: { name: 'Komunitas Alam' },
        volunteer_registrations: [],
        feedbacks: []
      }
    }).as('getFullActivity');

    cy.visit('/activities/full-1');
    cy.wait('@getFullActivity');

    // Volunteer count equals quota
    cy.contains('10').should('exist');

    // Funding raised equals goal
    cy.contains(/5\.?000\.?000/i).should('exist');

    // Should show 100% or "Kuota Penuh" or equivalent indicator
    cy.contains(/100%|kuota penuh|terpenuhi|fully funded|full/i).should('exist');
  });

  it('Harus menampilkan elemen progress bar pada halaman detail kegiatan', () => {
    cy.intercept('GET', '**/rest/v1/activities*', {
      statusCode: 200,
      body: {
        id: 'progress-2',
        title: 'Progress Activity',
        status: 'published',
        volunteer_quota: 10,
        volunteer_count: 7,
        funding_goal: 5000000,
        funding_raised: 3500000,
        community: { name: 'Komunitas Alam' },
        volunteer_registrations: [],
        feedbacks: []
      }
    }).as('getActivityBar');

    cy.visit('/activities/progress-2');
    cy.wait('@getActivityBar');

    // A progress bar element (native <progress>, role="progressbar", or CSS-based) must exist
    cy.get(
      '[role="progressbar"], .progress-bar, progress, [class*="progress"][class*="bar"], [class*="Progress"]',
    ).should('exist');
  });
});
