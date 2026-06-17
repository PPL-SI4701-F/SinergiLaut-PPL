import './commands';
import { slowCypressDown } from 'cypress-slow-down';

// Configure slow down of 700ms (0.7 seconds) per command
slowCypressDown(700);

// Ignore uncaught exceptions in Cypress to prevent hydration mismatches
// or external library warnings from failing E2E tests.
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Global hook: run a clean database reset once before each test file
before(() => {
  // Only reset and seed the database if we are running the first test case of an FR
  if (Cypress.spec.name.includes('TC_01')) {
    // Run the db:reset script. We set a large timeout as wiping and seeding the DB takes time.
    cy.exec('npm run db:reset', { timeout: 300000, failOnNonZeroExit: false });
    // Wait 5 seconds to ensure Supabase PostgREST cache has fully reloaded
    cy.wait(5000);
  }
});
