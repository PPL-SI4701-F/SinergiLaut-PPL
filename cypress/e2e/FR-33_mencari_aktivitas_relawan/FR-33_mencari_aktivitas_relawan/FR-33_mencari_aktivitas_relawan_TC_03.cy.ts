import { fr33Activities, openFR33Activities, selectFR33Location } from './fr33.helpers';

describe('FR-33: Mencari aktivitas relawan', () => {
  beforeEach(() => {
    openFR33Activities();
  });

  it('TC-FR33-003 - Harus memfilter kegiatan berdasarkan lokasi', () => {
    selectFR33Location('Pantai Losari, Makassar');

    cy.contains(fr33Activities.cleanup).should('be.visible');
    cy.contains(fr33Activities.restoration).should('not.exist');
    cy.contains(fr33Activities.completed).should('not.exist');
    cy.contains('1 kegiatan ditemukan').should('be.visible');
  });
});
