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
  cy.get('input#email').clear().type(email)
  cy.get('input#password').clear().type(password)
  cy.get('button[type="submit"]').click()
  
  // Check if an error appears and fail immediately if it does
  cy.get('body').then($body => {
    // Wait a brief moment for any server action to return
    cy.wait(500).then(() => {
      const $error = cy.$$('.sl-login-error');
      if ($error.length > 0) {
        throw new Error(`Login failed with UI error: ${$error.text()}`);
      }
    });
  });

  // Wait for redirect to complete
  cy.url({ timeout: 15000 }).should('not.include', '/login')
})

export {}
