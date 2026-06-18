import {
  completeSimulatedPayment,
  openFR09DonationForm,
  selectOneGloveItem,
  waitForFR09Donation,
} from './fr09.helpers';

describe('FR-09: Donasi uang dan barang', () => {
  beforeEach(() => {
    openFR09DonationForm();
  });

  it('TC-FR09-003 - Pengguna berhasil melakukan fulfillment barang', () => {
    selectOneGloveItem();
    cy.contains('button', /Bayar Fulfillment/).click();
    cy.contains('Pilih Metode Pembayaran').should('be.visible');
    cy.contains(/Rp\s*13\.200/).should('be.visible');

    completeSimulatedPayment();

    waitForFR09Donation(
      'item',
      (donation) => {
        const gloves = donation.itemsNeeded.find((item) => item.item_name === 'Sarung Tangan Karet');
        return donation.status === 'completed' && donation.fundingRaised === '13200' && gloves?.donated === 1;
      },
      'donasi barang berstatus completed',
    ).then((donation) => {
      expect(donation.status).to.equal('completed');
      expect(donation.amount).to.equal('13200');
      expect(donation.items).to.deep.equal([
        { item_name: 'Sarung Tangan Karet', quantity: 1 },
      ]);
      expect(donation.fundingRaised).to.equal('13200');
    });
  });
});
