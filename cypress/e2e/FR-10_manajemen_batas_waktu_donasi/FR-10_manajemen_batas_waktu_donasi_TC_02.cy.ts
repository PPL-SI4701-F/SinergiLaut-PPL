import {
  completeFR10MoneyDonation,
  openFR10Activity,
  prepareFR10TestCase,
  waitForFR10Donation,
} from './fr10.helpers';

describe('FR-10: Manajemen batas waktu donasi', () => {
  beforeEach(() => {
    prepareFR10TestCase();
  });

  it('TC-FR10-002 - Harus berhasil berdonasi sebelum deadline dan tersimpan di database', () => {
    openFR10Activity('active');
    completeFR10MoneyDonation('100000');

    waitForFR10Donation(
      (donation) => donation.status === 'completed' && donation.fundingRaised === '100000',
    ).then((donation) => {
      expect(donation.donorName).to.equal('Alya Donatur FR10');
      expect(donation.donorEmail).to.equal('fr10.donor@test.local');
      expect(donation.type).to.equal('money');
      expect(donation.amount).to.equal('100000');
      expect(donation.status).to.equal('completed');
      expect(donation.fundingRaised).to.equal('100000');
    });
  });
});
