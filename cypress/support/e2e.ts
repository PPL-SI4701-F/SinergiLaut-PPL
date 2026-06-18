import './commands';
import { slowCypressDown } from 'cypress-slow-down';

// Configure slow down of 5000ms (5 seconds) per command
slowCypressDown(1000);

// Ignore uncaught exceptions in Cypress to prevent hydration mismatches
// or external library warnings from failing E2E tests.
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Global hook: run a clean database reset once before each test file
before(() => {
  const isFR05ManagementSpec = Cypress.spec.relative.includes('FR-05_manajemen_kegiatan_konservasi');
  const isFR06StatusSpec = Cypress.spec.relative.includes('FR-06_manajemen_status_kegiatan');
  const isFR08VolunteerRegistrationSpec = Cypress.spec.relative.includes('FR-08_pendaftaran_relawan');
  const isFR09DonationManagementSpec = Cypress.spec.relative.includes('FR-09_manajemen_donasi');
  const isFR33VolunteerActivitySpec = Cypress.spec.relative.includes('FR-33_mencari_aktivitas_relawan');

  if (
    isFR05ManagementSpec ||
    isFR06StatusSpec ||
    isFR08VolunteerRegistrationSpec ||
    isFR09DonationManagementSpec ||
    isFR33VolunteerActivitySpec
  ) {
    return;
  }

  // Only reset and seed the database if we are running the first test case of an FR
  if (Cypress.spec.name.includes('TC_01')) {
    // Run the db:reset script. We set a large timeout as wiping and seeding the DB takes time.
    cy.exec('npm run db:reset', { timeout: 300000, failOnNonZeroExit: false });
    // Wait 5 seconds to ensure Supabase PostgREST cache has fully reloaded
    cy.wait(5000);
  }
});
