import {
  activityCard,
  expectFR06ActivityStatus,
  fr06Activities,
  loginAsFR06Admin,
  visitAdminActivities,
} from './fr06.helpers';

describe('FR-06: Manajemen status kegiatan', () => {
  beforeEach(() => {
    loginAsFR06Admin();
  });

  it('TC-FR06-005 - Harus menyetujui kegiatan dan mempublikasikannya di database', () => {
    visitAdminActivities();

    activityCard(fr06Activities.approvePending).within(() => {
      cy.contains('button', /Publis|Setujui/i).click();
    });

    cy.contains('Kegiatan berhasil dipublikasikan').should('be.visible');
    expectFR06ActivityStatus(fr06Activities.approvePending, 'published');

    cy.task('getFR06ActivityByTitle', fr06Activities.approvePending).then((activity: any) => {
      expect(activity.publishedAt, 'published_at is filled').to.not.equal(null);
    });
  });
});
