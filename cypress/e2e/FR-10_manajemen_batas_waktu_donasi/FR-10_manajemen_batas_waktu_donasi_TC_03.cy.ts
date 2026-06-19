import { openFR10Activity, prepareFR10TestCase } from './fr10.helpers';

describe('FR-10: Manajemen batas waktu donasi', () => {
  beforeEach(() => {
    prepareFR10TestCase();
  });

  it('TC-FR10-003 - Harus memblokir donasi setelah batas waktu pengumpulan berakhir', () => {
    openFR10Activity('expired').then((activity) => {
      cy.contains('Batas waktu pengumpulan habis').should('be.visible');
      cy.contains('button', 'Batas Waktu Habis').should('be.visible').and('be.disabled');

      cy.visit(`/activities/${activity.id}?tab=donate`);
      cy.contains('Donasi untuk Kegiatan Ini').should('not.exist');
      cy.contains('Batas waktu pengumpulan habis').should('be.visible');
    });
  });
});
