describe('FR-14: Rating & feedback kegiatan', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');

    cy.intercept('GET', '**/auth/v1/user*', {
      statusCode: 200,
      body: {
        id: 'user-id-1',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'user@example.com',
        user_metadata: { role: 'user', full_name: 'Budi' }
      }
    });

    // Mock feedacks on public page
    cy.intercept('GET', '**/rest/v1/feedbacks*', {
      statusCode: 200,
      body: [
        { id: 'fb-1', rating: 5, comment: 'Kegiatan yang sangat bermanfaat!', user: { full_name: 'Budi' } }
      ]
    }).as('getFeedbacks');
  });

  it('Harus mengizinkan pengguna mengirim ulasan dan menampilkannya di halaman publik', () => {
    // 1. User submits feedback
    cy.intercept('POST', '**/rest/v1/feedbacks*', {
      statusCode: 201,
      body: [{ id: 'fb-new', rating: 4, comment: 'Bagus!' }]
    }).as('postFeedback');

    cy.visit('/user/dashboard');
    // Assuming there's a button to review a completed activity
    cy.contains(/Beri Ulasan|Feedback|Review/i).click({ force: true });
    
    cy.get('input[name="rating"], .rating-stars, select[name="rating"]').click({ force: true }); 
    cy.get('textarea[name="comment"]').type('Bagus!');
    cy.contains('button', /Kirim|Submit/i).click();
    
    cy.wait('@postFeedback');

    // 2. View on public page
    cy.visit('/activities/completed-activity');
    cy.wait('@getFeedbacks');
    cy.contains('Kegiatan yang sangat bermanfaat!').should('be.visible');
    cy.contains('Budi').should('be.visible');
  });
});
