import {
  activityCard,
  fr05Activities,
  fr05ActivitySlugs,
  loginAsFR05Community,
  visitCommunityDashboard,
  waitForFR05Activity,
} from './fr05.helpers';

describe('FR-05: Manajemen kegiatan konservasi', () => {
  beforeEach(() => {
    loginAsFR05Community();
  });

  it('TC-FR05-006 - Harus berhasil membatalkan kegiatan berstatus Menunggu Review', () => {
    visitCommunityDashboard();

    activityCard(fr05Activities.pendingReview).within(() => {
      cy.contains('button', 'Batalkan').click();
    });

    cy.contains('Ya, Batalkan').click();
    cy.contains('berhasil dibatalkan').should('be.visible');

    activityCard(fr05Activities.pendingReview).within(() => {
      cy.contains('Dibatalkan').should('be.visible');
      cy.contains('button', 'Hapus').should('be.visible');
    });

    waitForFR05Activity(
      fr05ActivitySlugs.pendingReview,
      (activity) => activity?.status === 'cancelled',
      'status kegiatan berubah menjadi cancelled',
    ).then((activity) => {
      expect(activity, 'activity row in Supabase testing').to.not.equal(null);
      expect(activity!.status).to.equal('cancelled');
    });
  });
});
