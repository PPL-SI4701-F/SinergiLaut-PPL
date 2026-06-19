import { fr33Activities, openFR33Activities, openFR33CleanupDetail } from './fr33.helpers';

describe('FR-33: Mencari aktivitas relawan', () => {
  beforeEach(() => {
    openFR33Activities();
  });

  it('TC-FR33-006 - Harus membuka detail kegiatan dari hasil pencarian', () => {
    openFR33CleanupDetail();

    cy.contains(fr33Activities.cleanup).should('be.visible');
    cy.contains('button', 'Daftar Relawan').should('be.visible');
  });
});
