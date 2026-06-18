import { activityCard, fr06Activities, loginAsFR06Admin, visitAdminActivities } from './fr06.helpers';

describe('FR-06: Manajemen status kegiatan', () => {
  beforeEach(() => {
    loginAsFR06Admin();
  });

  it('TC-FR06-003 - Harus mengizinkan admin memantau detail kegiatan yang sedang berjalan', () => {
    visitAdminActivities();

    activityCard(fr06Activities.published).within(() => {
      cy.contains('a', /Pantau Detail/i).click();
    });

    cy.url().should('include', '/activities/');
    cy.contains(fr06Activities.published).should('be.visible');
  });
});
