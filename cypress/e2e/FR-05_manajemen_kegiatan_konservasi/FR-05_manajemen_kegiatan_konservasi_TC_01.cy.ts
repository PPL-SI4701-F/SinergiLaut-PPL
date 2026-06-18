import { fr05Activities, loginAsFR05Community, visitCommunityDashboard } from './fr05.helpers';

describe('FR-05: Manajemen kegiatan konservasi', () => {
  beforeEach(() => {
    cy.task('resetFR05Data');
    loginAsFR05Community();
  });

  it('TC-FR05-001 - Harus menampilkan daftar kegiatan dengan berbagai status di dashboard komunitas', () => {
    visitCommunityDashboard();

    cy.contains(fr05Activities.published).should('be.visible');
    cy.contains(fr05Activities.draft).should('be.visible');
    cy.contains(fr05Activities.pendingReview).should('be.visible');
    cy.contains(fr05Activities.cancelled).should('be.visible');
    cy.contains(fr05Activities.completed).should('be.visible');
  });
});
