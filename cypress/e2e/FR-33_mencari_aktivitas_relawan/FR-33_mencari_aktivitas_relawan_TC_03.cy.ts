import { fr33Activities, openFR33Activities, selectFR33Province } from './fr33.helpers';

describe('FR-33: Mencari aktivitas relawan', () => {
  beforeEach(() => {
    openFR33Activities();
  });

  it('TC-FR33-003 - Harus memfilter kegiatan berdasarkan provinsi Jawa Timur', () => {
    selectFR33Province('Jawa Timur');

    cy.contains('button.act-dropdown-btn', 'Jawa Timur').should('be.visible');
    cy.contains(fr33Activities.restoration).should('be.visible');
    cy.contains(fr33Activities.completed).should('be.visible');
    cy.contains(fr33Activities.cleanup).should('not.exist');
    cy.contains(/\d+ kegiatan ditemukan/).should('be.visible');

    cy.get('.act-card')
      .should('have.length.greaterThan', 0)
      .each(($card) => {
        cy.wrap($card).should('have.attr', 'data-province', 'Jawa Timur');
      });
  });
});
