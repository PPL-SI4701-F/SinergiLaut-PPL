import {
  assertActiveDonationCountdown,
  openFR10Activity,
  prepareFR10TestCase,
} from './fr10.helpers';

describe('FR-10: Manajemen batas waktu donasi', () => {
  beforeEach(() => {
    prepareFR10TestCase();
  });

  it('TC-FR10-001 - Harus menampilkan countdown sisa waktu ketika deadline masih aktif', () => {
    openFR10Activity('active').then((activity) => {
      assertActiveDonationCountdown(activity);
      cy.contains('button', 'Donasi Sekarang').should('be.visible').and('be.enabled');
    });
  });
});
