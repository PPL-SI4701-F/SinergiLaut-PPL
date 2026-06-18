import {
  activityCard,
  fr06Activities,
  loginAsFR06Admin,
  visitAdminActivities,
} from './fr06.helpers';

const rejectionNote = 'Deskripsi kegiatan dan bukti pendukung belum lengkap untuk dipublikasikan.';

describe('FR-06: Manajemen status kegiatan', () => {
  beforeEach(() => {
    loginAsFR06Admin();
  });

  it('TC-FR06-004 - Harus menolak kegiatan dan menyimpan catatan penolakan di database', () => {
    visitAdminActivities();

    activityCard(fr06Activities.rejectPending).within(() => {
      cy.contains('a', /Review/i).click();
    });

    cy.contains('Review Kegiatan').should('be.visible');
    cy.contains(fr06Activities.rejectPending).should('be.visible');
    cy.contains('button', 'Tolak Kegiatan').click();
    cy.get('textarea').clear().type(rejectionNote);
    cy.contains('button', 'Konfirmasi Tolak').click();

    cy.contains(/Kegiatan telah ditolak|Kegiatan ditolak/i).should('be.visible');
    cy.task('getFR06ActivityByTitle', fr06Activities.rejectPending).then((activity: any) => {
      expect(activity, 'rejected activity exists in Supabase testing').to.not.equal(null);
      expect(activity.status).to.equal('draft');
      expect(activity.adminNote).to.equal(rejectionNote);
    });
  });
});
