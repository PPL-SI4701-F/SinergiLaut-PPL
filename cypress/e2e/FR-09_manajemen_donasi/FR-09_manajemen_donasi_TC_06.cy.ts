import {
  fr09Admin,
  prepareFR09ManagementData,
} from './fr09.helpers';

describe('FR-09: Monitoring donasi oleh admin', () => {
  beforeEach(() => {
    prepareFR09ManagementData();
    cy.login(fr09Admin.email, fr09Admin.password);
  });

  it('TC-FR09-006 - Admin dapat memonitor total donasi terkumpul pada dashboard', () => {
    cy.visit('/admin/dashboard');

    cy.contains('Admin Dashboard').should('be.visible');
    cy.task<{
      totalCompletedMoney: string;
      fr09DonationCount: number;
    }>('getFR09AdminDonationSummary').then((summary) => {
      expect(summary.fr09DonationCount).to.equal(3);

      cy.contains('Total Donasi Terkumpul')
        .closest('[data-slot="card"]')
        .invoke('text')
        .then((text) => {
          const displayedAmount = text.replace(/\D/g, '');
          expect(displayedAmount).to.equal(summary.totalCompletedMoney);
        });
    });
  });
});
