import { activityCard, fr05Activities, loginAsFR05Community, visitCommunityDashboard } from './fr05.helpers';

describe('FR-05: Manajemen kegiatan konservasi', () => {
  beforeEach(() => {
    loginAsFR05Community();
  });

  it('TC-FR05-005 - Harus menampilkan dialog konfirmasi dan membatalkan aksi jika memilih Tidak', () => {
    visitCommunityDashboard();

    activityCard(fr05Activities.pendingReview).within(() => {
      cy.contains('button', 'Batalkan').click();
    });

    cy.contains('Batalkan kegiatan ini?').should('be.visible');
    cy.contains('Tindakan ini tidak dapat diurungkan.').should('be.visible');

    cy.contains('button', 'Tidak').click();
    cy.contains(fr05Activities.pendingReview).should('be.visible');

    cy.task('getActivityByTitle', fr05Activities.pendingReview).then((activity: any) => {
      expect(activity, 'activity row in Supabase testing').to.not.equal(null);
      expect(activity.status).to.equal('pending_review');
    });
  });
});
