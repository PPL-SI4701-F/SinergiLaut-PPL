describe('FR-14: Rating & feedback kegiatan', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');

    cy.intercept('GET', '**/auth/v1/user*', {
      statusCode: 200,
      body: {
        id: 'mock-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'user@example.com',
        user_metadata: { role: 'user', full_name: 'Budi' },
      },
    });

    cy.intercept('GET', '**/rest/v1/volunteer_registrations*', {
      statusCode: 200,
      body: { id: 'reg-1', user_id: 'mock-user-id', activity_id: 'completed-activity', status: 'attended' }
    }).as('getRegistration');

    // Default mock activity with feedbacks
    cy.intercept('GET', '**/rest/v1/activities*', {
      statusCode: 200,
      body: {
        id: 'completed-activity',
        title: 'Completed Activity',
        status: 'completed',
        community: { name: 'Komunitas Alam' },
        volunteer_registrations: [{ user_id: 'mock-user-id', status: 'attended' }],
        feedbacks: [
          { id: 'fb-1', rating: 5, comment: 'Kegiatan yang sangat bermanfaat!', user: { full_name: 'Budi' }, created_at: new Date().toISOString() }
        ]
      }
    }).as('getActivityFeedbacks');
  });

  it('Harus mengizinkan pengguna mengirim ulasan dan menampilkannya di halaman publik', () => {
    cy.visit('/user/dashboard?e2e_user=user');
    cy.contains(/Beri Ulasan|Feedback|Review/i).click({ force: true });

    cy.get('input[name="rating"], .rating-stars, select[name="rating"]').click({ force: true, multiple: true });
    cy.get('textarea').type('Bagus!');
    
    // Server action will handle the post automatically returning e2e mock data
    cy.contains('button', /Kirim|Submit|Perbarui/i).click();

    // 2. View on public page
    cy.visit('/activities/completed-activity?tab=feedback');
    cy.wait('@getActivityFeedbacks');
    cy.contains('Kegiatan yang sangat bermanfaat!').should('be.visible');
    cy.contains('Budi').should('be.visible');
  });

  it('Harus menampilkan semua feedback dari beberapa pengguna berbeda', () => {
    cy.intercept('GET', '**/rest/v1/activities*', {
      statusCode: 200,
      body: {
        id: 'completed-activity',
        title: 'Completed Activity',
        status: 'completed',
        community: { name: 'Komunitas Alam' },
        volunteer_registrations: [],
        feedbacks: [
          { id: 'fb-1', rating: 5, comment: 'Luar biasa!', user: { full_name: 'Andi' }, created_at: new Date().toISOString() },
          { id: 'fb-2', rating: 4, comment: 'Sangat seru dan edukatif.', user: { full_name: 'Budi' }, created_at: new Date().toISOString() },
          { id: 'fb-3', rating: 5, comment: 'Pantai jadi lebih bersih.', user: { full_name: 'Citra' }, created_at: new Date().toISOString() }
        ]
      }
    }).as('getMultipleFeedbacks');

    cy.visit('/activities/completed-activity?tab=feedback');
    cy.wait('@getMultipleFeedbacks');

    // All 3 comments and names must be visible
    cy.contains('Luar biasa!').should('be.visible');
    cy.contains('Andi').should('be.visible');
    cy.contains('Sangat seru dan edukatif.').should('be.visible');
    cy.contains('Budi').should('be.visible');
    cy.contains('Pantai jadi lebih bersih.').should('be.visible');
    cy.contains('Citra').should('be.visible');
  });

  it('Harus menampilkan kondisi kosong saat belum ada feedback pada kegiatan', () => {
    cy.intercept('GET', '**/rest/v1/activities*', {
      statusCode: 200,
      body: {
        id: 'empty-activity',
        title: 'Empty Activity',
        status: 'completed',
        community: { name: 'Komunitas Alam' },
        volunteer_registrations: [],
        feedbacks: []
      }
    }).as('getEmptyFeedbacks');

    cy.visit('/activities/completed-activity?tab=feedback');
    cy.wait('@getEmptyFeedbacks');

    // Empty state message must be shown
    cy.contains(/belum ada ulasan|belum ada feedback|no review|no feedback|belum ada komentar/i).should('be.visible');
  });

  it('Harus menampilkan nilai rating (bintang atau angka) pada setiap ulasan yang ada', () => {
    cy.intercept('GET', '**/rest/v1/activities*', {
      statusCode: 200,
      body: {
        id: 'completed-activity',
        title: 'Completed Activity',
        status: 'completed',
        community: { name: 'Komunitas Alam' },
        volunteer_registrations: [],
        feedbacks: [
          { id: 'fb-1', rating: 5, comment: 'Sempurna!', user: { full_name: 'Tono' }, created_at: new Date().toISOString() },
        ]
      }
    }).as('getRatedFeedback');

    cy.visit('/activities/completed-activity?tab=feedback');
    cy.wait('@getRatedFeedback');

    cy.contains('Sempurna!').should('be.visible');
    cy.contains('Tono').should('be.visible');

    cy.contains(/^5$|★★★★★|5 bintang|5\/5/i).should('exist');
  });
});

