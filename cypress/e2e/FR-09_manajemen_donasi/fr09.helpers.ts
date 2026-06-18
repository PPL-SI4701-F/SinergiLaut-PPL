export const fr09User = {
  email: 'fr09.donor@test.local',
  password: 'Password@2026',
  fullName: 'Raka Donatur FR09',
  phone: '081234567898',
};

export const fr09CommunityOwner = {
  email: 'fr09.owner@test.local',
  password: 'Password@2026',
};

export const fr09Admin = {
  email: 'admin1@sinergilaut.id',
  password: 'Password@2026',
};

export const fr09Activity = {
  title: 'FR09 Konservasi Pesisir Nusantara',
};

type FR09DonationType = 'money' | 'item';

type FR09Donation = {
  donorName: string;
  donorEmail: string;
  type: FR09DonationType;
  amount: string | null;
  status: string;
  isAnonymous: boolean;
  items: Array<{
    item_name: string;
    quantity: number;
  }>;
  fundingRaised: string;
  itemsNeeded: Array<{
    item_name: string;
    target: number;
    donated: number;
    unit_price: number;
  }>;
};

export function openFR09DonationForm() {
  cy.task('resetFR09Data');
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.login(fr09User.email, fr09User.password);

  cy.task('getFR09Activity').then((activity: any) => {
    expect(activity, 'FR-09 activity seed exists').to.not.equal(null);
    cy.visit(`/activities/${activity.id}?tab=donate`);
  });

  cy.contains(fr09Activity.title, { timeout: 30000 }).should('be.visible');
  cy.contains('Donasi untuk Kegiatan Ini', { timeout: 30000 }).should('be.visible');
  cy.get('input[placeholder="Nama Anda"]').should('have.value', fr09User.fullName);
  cy.get('input[placeholder="email@example.com"]').should('have.value', fr09User.email);
}

export function prepareFR09ManagementData() {
  cy.task('resetFR09Data');
  cy.task('seedFR09ManagementData');
  cy.clearCookies();
  cy.clearLocalStorage();
}

export function loginAsFR09CommunityOwner() {
  prepareFR09ManagementData();
  cy.login(fr09CommunityOwner.email, fr09CommunityOwner.password);
  cy.reload();
  cy.url({ timeout: 30000 }).should('include', '/community/dashboard');
}

export function getFR09Activity() {
  return cy.task<{ id: string; title: string } | null>('getFR09Activity').then((activity) => {
    expect(activity, 'FR-09 activity seed exists').to.not.equal(null);
    return activity!;
  });
}

export function setMoneyAmount(amount: string) {
  cy.get('input[placeholder="Atau masukkan nominal lain (min. Rp 1.000)"]')
    .clear()
    .type(amount);
}

export function openPaymentSimulation() {
  cy.contains('button', /^Bayar Rp/).click();
  cy.contains('Pilih Metode Pembayaran', { timeout: 30000 }).should('be.visible');
}

export function completeSimulatedPayment() {
  cy.contains('button', 'QRIS').click();
  cy.contains('Selesaikan Pembayaran').should('be.visible');
  cy.contains('button', 'Submit (Simulasi Sukses)').click();
  cy.contains(/Pembayaran berhasil/i).should('be.visible');
  cy.get('[role="dialog"]').should('not.exist');
}

export function selectOneGloveItem() {
  cy.contains('button', 'Fulfillment Barang').click();
  cy.contains('Sarung Tangan Karet')
    .closest('.border')
    .within(() => {
      cy.contains('button', '+').click();
      cy.contains(/^1$/).should('be.visible');
    });
  cy.contains('Ringkasan Belanja').should('be.visible');
}

export function waitForFR09Donation(
  type: FR09DonationType,
  predicate: (donation: FR09Donation) => boolean,
  description: string,
  retries = 20,
): Cypress.Chainable<FR09Donation> {
  const poll = (attempt: number): Cypress.Chainable<FR09Donation> => {
    return cy.task<FR09Donation | null>('getFR09LatestDonation', type, { log: false }).then((donation) => {
      if (donation && predicate(donation)) {
        return donation;
      }

      if (attempt >= retries) {
        throw new Error(`Timeout menunggu ${description}. Data terakhir: ${JSON.stringify(donation)}`);
      }

      return cy.wait(500, { log: false }).then(() => poll(attempt + 1));
    });
  };

  return poll(1);
}
