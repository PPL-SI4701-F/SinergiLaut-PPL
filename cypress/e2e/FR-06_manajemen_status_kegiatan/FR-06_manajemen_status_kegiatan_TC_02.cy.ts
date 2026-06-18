import { activityCard, fr06Activities, loginAsFR06Admin, visitAdminActivities } from './fr06.helpers';

describe('FR-06: Manajemen status kegiatan', () => {
  beforeEach(() => {
    loginAsFR06Admin();
  });

  it('TC-FR06-002 - Harus mengizinkan admin meninjau detail kegiatan yang menunggu persetujuan', () => {
    visitAdminActivities();

    activityCard(fr06Activities.approvePending).within(() => {
      cy.contains('a', /Review/i).click();
    });

    cy.url().should('include', '/admin/activities/');
    cy.url().should('include', '/review');
    cy.contains('Review Kegiatan').should('be.visible');
    cy.contains(fr06Activities.approvePending).should('be.visible');
    cy.contains('Menunggu Review').should('be.visible');
    cy.contains('Setujui & Publikasikan').should('be.visible');
    cy.contains('Tolak Kegiatan').should('be.visible');
  });
});
