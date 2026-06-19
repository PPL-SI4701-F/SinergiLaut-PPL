import { openFR10Activity, prepareFR10TestCase } from './fr10.helpers';

describe('FR-10: Manajemen batas waktu donasi', () => {
  beforeEach(() => {
    prepareFR10TestCase();
  });

  it('TC-FR10-004 - Harus tidak membuat data donasi setelah deadline berakhir', () => {
    cy.task<number>('countFR10ExpiredDonations').should('equal', 0);

    openFR10Activity('expired').then((activity) => {
      cy.visit(`/activities/${activity.id}?tab=donate`);
      cy.contains('Donasi untuk Kegiatan Ini').should('not.exist');
      cy.contains('button', 'Batas Waktu Habis').should('be.disabled');
    });

    cy.task<number>('countFR10ExpiredDonations').should('equal', 0);
  });
});
