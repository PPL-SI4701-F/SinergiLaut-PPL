describe('FR-06: Manajemen status kegiatan', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'admin');

    // Intercepts for activities are no longer needed here since Server Actions 
    // natively return the E2E mock data using getE2EMock().

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
    
    // Mock the activity fetch on the detail page which uses Supabase client directly
    cy.intercept('GET', '**/rest/v1/activities*', {
      statusCode: 200,
      body: {
        id: 'activity-3',
        title: 'Ongoing Activity 1',
        status: 'published',
        start_date: new Date().toISOString(),
        community: { name: 'Eco Ocean' },
        reports: [],
        feedbacks: [],
        volunteer_registrations: []
      }
    });

    cy.contains('Ongoing Activity 1').should('be.visible');
    cy.contains(/Pantau Detail/i).click({ force: true });

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
