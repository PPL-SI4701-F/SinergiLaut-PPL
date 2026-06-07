// Ignore uncaught exceptions in Cypress to prevent hydration mismatches
// or external library warnings from failing E2E tests.
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});
