import {
  completeSimulatedPayment,
  openFR09DonationForm,
  openPaymentSimulation,
  setMoneyAmount,
  waitForFR09Donation,
} from './fr09.helpers';

describe('FR-09: Manajemen donasi', () => {
  beforeEach(() => {
    openFR09DonationForm();
  });

  it('TC-FR09-004 - Harus berhasil melakukan donasi anonim', () => {
    cy.get('#anon').check();
    cy.get('input[placeholder="Nama Anda"]').should('be.disabled');

    setMoneyAmount('50000');
    openPaymentSimulation();
    cy.contains(/Rp\s*50\.000/).should('be.visible');
    completeSimulatedPayment();

    waitForFR09Donation(
      'money',
      (donation) => donation.status === 'completed'
        && donation.amount === '50000'
        && donation.isAnonymous
        && donation.fundingRaised === '50000',
      'donasi anonim selesai dan tersimpan di database',
    ).then((donation) => {
      expect(donation.donorName).to.equal('Donatur Anonim');
      expect(donation.donorEmail).to.equal('fr09.donor@test.local');
      expect(donation.amount).to.equal('50000');
      expect(donation.status).to.equal('completed');
      expect(donation.isAnonymous).to.equal(true);
      expect(donation.fundingRaised).to.equal('50000');
    });
  });
});
