import { fr05Activities, loginAsFR05Community, visitCommunityDashboard } from './fr05.helpers';

describe('FR-05: Manajemen kegiatan konservasi', () => {
  beforeEach(() => {
    loginAsFR05Community();
  });

  it('TC-FR05-002 - Harus memfilter daftar kegiatan berdasarkan semua status utama', () => {
    visitCommunityDashboard();

    const selectStatus = (label: string) => {
      cy.get('[role="listbox"]').should('not.exist');
      cy.contains('button', /Semua Status|Draft|Menunggu Review|Aktif|Selesai|Dibatalkan/).click();
      cy.contains('[role="option"]', label).click();
    };

    selectStatus('Draft');
    cy.contains(fr05Activities.draft).should('be.visible');
    cy.contains(fr05Activities.published).should('not.exist');
    cy.contains(fr05Activities.pendingReview).should('not.exist');

    selectStatus('Menunggu Review');
    cy.contains(fr05Activities.pendingReviewAlt).should('be.visible');
    cy.contains(fr05Activities.draft).should('not.exist');
    cy.contains(fr05Activities.published).should('not.exist');
    cy.contains(fr05Activities.completed).should('not.exist');

    selectStatus('Aktif');
    cy.contains(fr05Activities.published).should('be.visible');
    cy.contains(fr05Activities.draft).should('not.exist');
    cy.contains(fr05Activities.completed).should('not.exist');

    selectStatus('Selesai');
    cy.contains(fr05Activities.completed).should('be.visible');
    cy.contains(fr05Activities.published).should('not.exist');
    cy.contains(fr05Activities.draft).should('not.exist');

    selectStatus('Dibatalkan');
    cy.contains(fr05Activities.cancelled).should('be.visible');
    cy.contains('Dibatalkan').should('be.visible');
    cy.contains(fr05Activities.published).should('not.exist');
    cy.contains(fr05Activities.completed).should('not.exist');
    cy.contains(fr05Activities.draft).should('not.exist');
  });
});
