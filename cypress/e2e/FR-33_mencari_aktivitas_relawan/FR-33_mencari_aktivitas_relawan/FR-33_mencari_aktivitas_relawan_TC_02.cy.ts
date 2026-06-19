import { fr33Activities, openFR33Activities, searchFR33Activity } from './fr33.helpers';

describe('FR-33: Mencari aktivitas relawan', () => {
  beforeEach(() => {
    openFR33Activities();
  });

  it('TC-FR33-002 - Harus mencari kegiatan berdasarkan kata kunci', () => {
    searchFR33Activity('Habitat Penyu');

    cy.contains(fr33Activities.restoration).should('be.visible');
    cy.contains(fr33Activities.cleanup).should('not.exist');
    cy.contains(fr33Activities.completed).should('not.exist');
    cy.contains('1 kegiatan ditemukan').should('be.visible');

    cy.get('input[placeholder="Cari kegiatan konservasi..."]').clear();
    cy.contains(fr33Activities.cleanup).should('be.visible');
    cy.contains(fr33Activities.restoration).should('be.visible');
  });
});
