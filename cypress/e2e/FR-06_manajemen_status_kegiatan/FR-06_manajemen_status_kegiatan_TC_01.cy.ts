import { fr06Activities, loginAsFR06Admin, visitAdminActivities } from './fr06.helpers';

describe('FR-06: Manajemen status kegiatan', () => {
  beforeEach(() => {
    loginAsFR06Admin();
  });

  it('TC-FR06-001 - Harus menampilkan kegiatan menunggu persetujuan dan kegiatan berjalan', () => {
    visitAdminActivities();

    cy.contains('Kegiatan Menunggu Persetujuan').should('be.visible');
    cy.contains(fr06Activities.approvePending).should('be.visible');
    cy.contains(fr06Activities.rejectPending).should('be.visible');

    cy.contains('Monitoring Kegiatan Berjalan').should('be.visible');
    cy.contains(fr06Activities.published).should('be.visible');
    cy.contains(fr06Activities.completed).should('be.visible');
  });
});
