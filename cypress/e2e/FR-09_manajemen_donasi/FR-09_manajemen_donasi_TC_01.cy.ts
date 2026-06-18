import {
  completeSimulatedPayment,
  openFR09DonationForm,
  openPaymentSimulation,
  setMoneyAmount,
  waitForFR09Donation,
} from './fr09.helpers';

describe('FR-09: Donasi uang dan barang', () => {
  beforeEach(() => {
    openFR09DonationForm();
  });

  it('TC-FR09-001 - Pengguna berhasil melakukan donasi uang', () => {
    setMoneyAmount('100000');
    openPaymentSimulation();
    cy.contains(/Rp\s*100\.000/).should('be.visible');

    completeSimulatedPayment();

    waitForFR09Donation(
      'money',
      (donation) => donation.status === 'completed' && donation.fundingRaised === '100000',
      'donasi uang berstatus completed',
    ).then((donation) => {
      expect(donation.donorName).to.equal('Raka Donatur FR09');
      expect(donation.amount).to.equal('100000');
      expect(donation.status).to.equal('completed');
      expect(donation.fundingRaised).to.equal('100000');
    });
  });
});
