describe('FR-06: Manajemen status kegiatan', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin');

    // Intercept GET for activity-1 (Review page) - Using flexible wildcard matching to handle Postgrest select params
    cy.intercept('GET', '**/rest/v1/activities*id=eq.activity-1*', {
      statusCode: 200,
      body: {
        id: "activity-1",
        title: "Pending Activity 1",
        description: "Deskripsi kegiatan pending",
        location: "Pantai Indah",
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        status: "pending_review",
        cover_image_url: null,
        category: "Penanaman Mangrove",
        volunteer_quota: 10,
        volunteer_count: 0,
        funding_goal: 5000000,
        funding_raised: 0,
        published_at: null,
        community_id: "community-1",
        community: {
          id: "community-1",
          name: "Eco Ocean",
          logo_url: null,
          is_verified: true,
          location: "Jakarta",
          owner: {
            full_name: "Owner Name",
            email: "owner@eco.org"
          }
        },
        reports: [],
        feedbacks: [],
        items_needed: [],
        volunteer_registrations: []
      }
    }).as('getPendingActivityDetail');

    // Intercept GET for activity-3 (Pantau Detail page) - Using flexible wildcard matching
    cy.intercept('GET', '**/rest/v1/activities*id=eq.activity-3*', {
      statusCode: 200,
      body: {
        id: "activity-3",
        title: "Ongoing Activity 1",
        description: "Deskripsi kegiatan ongoing",
        location: "Pantai Indah",
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        status: "published",
        cover_image_url: null,
        category: "Pembersihan Pantai",
        volunteer_quota: 50,
        volunteer_count: 5,
        funding_goal: 10000000,
        funding_raised: 2000000,
        published_at: new Date().toISOString(),
        community_id: "community-1",
        community: { id: "community-1", name: "Eco Ocean", logo_url: null, is_verified: true },
        reports: [],
        feedbacks: [],
        items_needed: [],
        volunteer_registrations: []
      }
    }).as('getOngoingActivityDetail');

    // Intercept volunteer registrations to avoid database errors on the activity detail page
    cy.intercept('GET', '**/rest/v1/volunteer_registrations*', {
      statusCode: 200,
      body: []
    }).as('getVolunteerRegistrations');
  });

  it('Harus memuat dan menampilkan daftar kegiatan menunggu persetujuan dan berlangsung', () => {
    cy.visit('/admin/activities');
    cy.contains('Kelola Kegiatan').should('be.visible');
    cy.contains('Pending Activity 1').should('be.visible');
    cy.contains('Pending Activity 2').should('be.visible');
    cy.contains('Ongoing Activity 1').should('be.visible');
  });

  it('Harus mengizinkan admin meninjau detail kegiatan yang menunggu persetujuan', () => {
    cy.visit('/admin/activities');
    cy.contains('Pending Activity 1')
      .parents('.border-blue-200')
      .find('a')
      .contains(/Review/i)
      .click({ force: true });
    
    // Assert redirect and correct content loads from the mock
    cy.url().should('include', '/admin/activities/activity-1/review');
    cy.contains('Review Kegiatan').should('be.visible');
    cy.contains('Pending Activity 1').should('be.visible');
  });

  it('Harus mengizinkan admin memantau detail kegiatan yang sedang berlangsung', () => {
    cy.visit('/admin/activities');
    cy.contains('Ongoing Activity 1')
      .parents('.border')
      .find('a')
      .contains(/Pantau Detail/i)
      .click({ force: true });

    // Assert redirect and correct content loads from the mock
    cy.url().should('include', '/activities/activity-3');
    cy.contains('Ongoing Activity 1').should('be.visible');
  });

  it('Harus mengizinkan admin menolak suatu kegiatan', () => {
    cy.visit('/admin/activities');
    
    // Find the activity and click Reject (assuming there's a Tolak button)
    cy.contains('Pending Activity 1')
      .parents('.border-blue-200')
      .find('button')
      .contains(/Tolak|Reject/i)
      .click({ force: true });
    
    // Verify toast or UI update
    cy.contains('Kegiatan ditolak').should('be.visible');
    cy.contains('Pending Activity 1').should('not.exist');
  });

  it('Harus mengizinkan admin menyetujui dan mempublikasikan kegiatan', () => {
    cy.visit('/admin/activities');
    
    cy.contains('Pending Activity 2')
      .parents('.border-blue-200')
      .find('button')
      .contains(/Publis|Setujui|Approve|Publish/i)
      .click({ force: true });
    
    cy.contains('Kegiatan berhasil dipublikasikan').should('be.visible');
    cy.contains('Pending Activity 2').should('not.exist');
  });
});
