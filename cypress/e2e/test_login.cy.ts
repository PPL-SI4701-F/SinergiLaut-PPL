describe('Login Test', () => {
  it('should login', () => {
    cy.visit('/login')
    cy.get('input#email').clear().type('admin1@sinergilaut.id')
    cy.get('input#password').clear().type('Password@2026')
    cy.get('button[type="submit"]').click()
    cy.url({ timeout: 15000 }).should('not.include', '/login')
  })
})
