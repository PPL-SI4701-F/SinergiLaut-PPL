export const fr10User = {
  email: 'fr10.donor@test.local',
  password: 'Password@2026',
};

type FR10Activity = {
  id: string;
  title: string;
  startDate: string;
  endDate: string | null;
};

type FR10ActivityCollection = {
  active: FR10Activity | null;
  expired: FR10Activity | null;
};

export type FR10Donation = {
  donorName: string;
  donorEmail: string;
  type: string;
  amount: string | null;
  status: string;
  fundingRaised: string;
};

export function prepareFR10TestCase() {
  cy.task('resetFR10Data');
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.login(fr10User.email, fr10User.password);
}

export function openFR10Activity(type: keyof FR10ActivityCollection) {
  return cy.task<FR10ActivityCollection>('getFR10Activities').then((activities) => {
    const activity = activities[type];
    expect(activity, `FR-10 ${type} activity seed exists`).to.not.equal(null);
    cy.visit(`/activities/${activity!.id}`);
    return cy.contains(activity!.title, { timeout: 30000 }).should('be.visible').then(() => activity!);
  });
}

export function assertActiveDonationCountdown(activity: FR10Activity) {
  const expectedDays = Math.max(
    0,
    Math.ceil((new Date(activity.endDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  cy.contains(/Sisa waktu pengumpulan: \d+ hari lagi/i)
    .should('be.visible')
    .invoke('text')
    .then((text) => {
      const displayedDays = Number(text.match(/(\d+)\s+hari/i)?.[1]);
      expect(displayedDays, 'countdown hari tersisa').to.equal(expectedDays);
    });
}

export function completeFR10MoneyDonation(amount: string) {
  cy.contains('button', 'Donasi Sekarang').should('be.enabled').click();
  cy.contains('Donasi untuk Kegiatan Ini').should('be.visible');
  cy.get('input[placeholder="Nama Anda"]').should('have.value', 'Alya Donatur FR10');
  cy.get('input[placeholder="email@example.com"]').should('have.value', fr10User.email);
  cy.get('input[placeholder="Atau masukkan nominal lain (min. Rp 1.000)"]')
    .clear()
    .type(amount);
  cy.contains('button', /^Bayar Rp/).click();
  cy.contains('Pilih Metode Pembayaran', { timeout: 30000 }).should('be.visible');
  cy.contains('button', 'QRIS').click();
  cy.contains('Selesaikan Pembayaran').should('be.visible');
  cy.contains('button', 'Submit (Simulasi Sukses)').click();
  cy.contains(/Pembayaran berhasil/i).should('be.visible');
  cy.get('[role="dialog"]').should('not.exist');
}

export function waitForFR10Donation(
  predicate: (donation: FR10Donation) => boolean,
  retries = 20,
): Cypress.Chainable<FR10Donation> {
  const poll = (attempt: number): Cypress.Chainable<FR10Donation> => {
    return cy.task<FR10Donation | null>('getFR10LatestDonation', null, { log: false }).then((donation) => {
      if (donation && predicate(donation)) {
        return donation;
      }

      if (attempt >= retries) {
        throw new Error(`Timeout menunggu donasi FR-10. Data terakhir: ${JSON.stringify(donation)}`);
      }

      return cy.wait(500, { log: false }).then(() => poll(attempt + 1));
    });
  };

  return poll(1);
}
