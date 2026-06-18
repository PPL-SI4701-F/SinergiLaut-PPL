import { activityCard, fr05Activities, loginAsFR05Community, visitCommunityDashboard } from './fr05.helpers';

describe('FR-05: Manajemen kegiatan konservasi', () => {
  beforeEach(() => {
    loginAsFR05Community();
  });

  it('TC-FR05-007 - Harus berhasil menghapus kegiatan berstatus Dibatalkan setelah konfirmasi', () => {
    visitCommunityDashboard();

    activityCard(fr05Activities.cancelled).within(() => {
      cy.contains('button', 'Hapus').click();
    });

    cy.contains('Hapus kegiatan ini?').should('be.visible');
    cy.contains('Ya, Hapus').click();
    cy.contains('berhasil dihapus').should('be.visible');
    cy.contains(fr05Activities.cancelled).should('not.exist');

    cy.reload();
    cy.contains('Kelola Kegiatan', { timeout: 30000 }).should('be.visible');
    cy.contains(fr05Activities.cancelled).should('not.exist');

    cy.task('getActivityByTitle', fr05Activities.cancelled).then((activity) => {
      expect(activity, 'deleted activity row in Supabase testing').to.equal(null);
    });
  });
});
