import { openFR09DonationForm, setMoneyAmount } from './fr09.helpers';

describe('FR-09: Donasi uang dan barang', () => {
  beforeEach(() => {
    openFR09DonationForm();
  });

  it('TC-FR09-002 - Harus menolak nominal donasi uang di bawah batas minimum', () => {
    setMoneyAmount('500');
    cy.contains('button', /Bayar Rp/).click({ force: true });

    cy.get('input[placeholder="Atau masukkan nominal lain (min. Rp 1.000)"]').then(($input) => {
      expect(($input[0] as HTMLInputElement).validity.valid).to.equal(false);
    });
    cy.contains('Pilih Metode Pembayaran').should('not.exist');
    cy.task('getFR09LatestDonation', 'money').should('equal', null);
  });
});
