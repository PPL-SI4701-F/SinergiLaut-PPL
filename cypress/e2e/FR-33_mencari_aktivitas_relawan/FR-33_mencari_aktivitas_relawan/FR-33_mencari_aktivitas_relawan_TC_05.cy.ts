import { fr33Activities, openFR33Activities, searchFR33Activity } from './fr33.helpers';

describe('FR-33: Mencari aktivitas relawan', () => {
  beforeEach(() => {
    openFR33Activities();
  });

  it('TC-FR33-005 - Harus menampilkan kondisi kosong ketika pencarian tidak memiliki hasil', () => {
    searchFR33Activity('aktivitas-yang-tidak-tersedia');

    cy.contains('Tidak ada kegiatan ditemukan').should('be.visible');
    cy.contains(fr33Activities.cleanup).should('not.exist');
    cy.contains(fr33Activities.restoration).should('not.exist');

    cy.get('input[placeholder="Cari kegiatan konservasi..."]').clear();
    cy.contains(fr33Activities.cleanup).should('be.visible');
  });
});
