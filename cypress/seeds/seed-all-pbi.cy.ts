describe('Seed all owned PBI test data', () => {
  it('prepares FR-05, FR-06, FR-08, FR-09, FR-10, and FR-33 data', () => {
    cy.task('resetFR05Data');
    cy.task('resetFR06Data');
    cy.task('resetFR08Data');
    cy.task('resetFR09Data');
    cy.task('seedFR09ManagementData');
    cy.task('resetFR10Data');
    cy.task('resetFR33Data');
  });
});
