describe('FR-17: Riwayat aktivitas pengguna', () => {
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

    // Mock history
    cy.intercept('GET', '**/rest/v1/volunteer_registrations*', {
      statusCode: 200,
      body: [
        { 
          id: 'reg-1', 
          status: 'attended', 
          activity: { title: 'Kegiatan Selesai', start_date: '2025-01-01T00:00:00Z', status: 'completed' } 
        }
      ]
    }).as('getUserHistory');
  });

  it('Harus menampilkan riwayat kegiatan di dashboard pengguna', () => {
    cy.visit('/user/dashboard');
    cy.wait('@getUserHistory');
    
    cy.contains('Kegiatan Selesai').should('exist');
    cy.contains(/Attended|Selesai/i).should('exist');
  });
});
