import { activityCard, fr05Activities, loginAsFR05Community, visitCommunityDashboard } from './fr05.helpers';

describe('FR-05: Manajemen kegiatan konservasi', () => {
  beforeEach(() => {
    loginAsFR05Community();
  });

  it('TC-FR05-004 - Harus menampilkan tombol Edit untuk kegiatan berstatus Draft', () => {
    visitCommunityDashboard();

    activityCard(fr05Activities.draft).within(() => {
      cy.contains('a', 'Edit')
        .should('have.attr', 'href')
        .and('include', '/edit');
    });
  });
});
