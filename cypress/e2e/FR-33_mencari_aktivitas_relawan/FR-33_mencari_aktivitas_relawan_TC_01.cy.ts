import { fr33Activities, openFR33Activities } from './fr33.helpers';

describe('FR-33: Mencari aktivitas relawan', () => {
  beforeEach(() => {
    openFR33Activities();
  });

  it('TC-FR33-001 - Harus menampilkan kegiatan yang sudah dipublikasikan atau selesai', () => {
    cy.contains('Kegiatan Aktif').should('be.visible');
    cy.contains(fr33Activities.cleanup).should('be.visible');
    cy.contains(fr33Activities.restoration).should('be.visible');

    cy.contains('Kegiatan Selesai').should('be.visible');
    cy.contains(fr33Activities.completed).should('be.visible');

    cy.contains(fr33Activities.draft).should('not.exist');
  });
});
