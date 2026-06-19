import { fr33Activities, openFR33Activities, selectFR33Type } from './fr33.helpers';

describe('FR-33: Mencari aktivitas relawan', () => {
  beforeEach(() => {
    openFR33Activities();
  });

  it('TC-FR33-004 - Harus memfilter kegiatan berdasarkan kategori', () => {
    selectFR33Type('Restoration');

    cy.contains(fr33Activities.restoration).should('be.visible');
    cy.contains(fr33Activities.cleanup).should('not.exist');
    cy.contains(fr33Activities.completed).should('not.exist');
    cy.contains(/\d+ kegiatan ditemukan/).should('be.visible');
    cy.get('.act-card').should('have.length.greaterThan', 0).each(($card) => {
      cy.wrap($card).find('.act-card-badge').should('have.text', 'restoration');
    });
  });
});
