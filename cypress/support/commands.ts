// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via UI.
       * Uses the seeded database users.
       * @example cy.login('pending1@user.com', 'Password@2026')
       */
      login(email?: string, password?: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (email = 'approved1@user.com', password = 'Password@2026') => {
  cy.visit('/login')

  cy.get('input#email', { timeout: 30000 })
    .should('be.visible')
    .and('be.enabled')
    .clear()
    .type(email)

  cy.get('input#password', { timeout: 30000 })
    .should('be.visible')
    .and('be.enabled')
    .clear()
    .type(password)

  cy.get('button[type="submit"]', { timeout: 30000 })
    .should('be.visible')
    .and('be.enabled')
    .click()

  cy.wait(500)
  cy.get('body').then(() => {
    const $error = cy.$$('.sl-error')
    if ($error.length > 0) {
      throw new Error(`Login failed with UI error: ${$error.text()}`)
    }
  })

  // Wait for redirect to complete
  cy.url({ timeout: 30000 }).should('not.include', '/login')
})

export {}
