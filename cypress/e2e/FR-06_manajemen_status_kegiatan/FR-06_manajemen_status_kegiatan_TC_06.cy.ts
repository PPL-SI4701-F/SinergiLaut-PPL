import { activityCard, fr06Activities, loginAsFR06Admin, visitAdminActivities } from './fr06.helpers';

describe('FR-06: Manajemen status kegiatan', () => {
  beforeEach(() => {
    loginAsFR06Admin();
  });

  it('TC-FR06-006 - Harus tidak menampilkan aksi review, publis, atau tolak pada kegiatan yang sudah aktif', () => {
    visitAdminActivities();

    activityCard(fr06Activities.published).within(() => {
      cy.contains('Aktif').should('be.visible');
      cy.contains('a', /Pantau Detail/i).should('be.visible');
      cy.contains('a', /Review/i).should('not.exist');
      cy.contains('button', /Publis|Tolak/i).should('not.exist');
    });
  });
});
