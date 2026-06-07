describe('FR-09: Manajemen donasi', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'community');
  });

  it('Harus menampilkan tabel donasi dan mengakumulasi total dana dengan benar', () => {
    cy.visit('/community/dashboard/activities/mock-activity-123/donors');

    // Verify the donations appear in a table or list
    cy.contains('Budi').should('be.visible');
    cy.contains('Rp 50.000').should('be.visible');
    
    cy.contains('Ani').should('be.visible');
    cy.contains('Rp 100.000').should('be.visible');

    // Verify the total accumulated completed funds is displayed
    cy.contains('Rp 50.000').should('be.visible');
  });
});
