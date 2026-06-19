export const fr33User = {
  email: 'fr33.volunteer@test.local',
  password: 'Password@2026',
  fullName: 'Nadia Relawan FR33',
  phone: '081234567896',
};

export const fr33Activities = {
  cleanup: 'FR33 Aksi Bersih Pantai Losari',
  restoration: 'FR33 Restorasi Habitat Penyu',
  completed: 'FR33 Edukasi Laut Telah Selesai',
  draft: 'FR33 Riset Laut Masih Draft',
};

export function openFR33Activities() {
  cy.task('resetFR33Data');
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.login(fr33User.email, fr33User.password);
  cy.visit('/activities');
  cy.contains('Kegiatan Konservasi Laut', { timeout: 30000 }).should('be.visible');
  cy.contains(fr33Activities.cleanup, { timeout: 30000 }).should('be.visible');
}

export function searchFR33Activity(keyword: string) {
  cy.get('input[placeholder="Cari kegiatan konservasi..."]').clear().type(keyword);
}

export function selectFR33Location(location: string) {
  cy.contains('button.act-dropdown-btn', /All Locations|Pantai Losari|Pantai Sukamade|Surabaya/).click();
  cy.contains('button.act-dropdown-item', location).click();
}

export function selectFR33Type(type: string) {
  cy.contains('button.act-dropdown-btn', /All Types|Cleanup|Restoration|Education/).click();
  cy.contains('button.act-dropdown-item', type).click();
}

export function openFR33CleanupDetail() {
  searchFR33Activity('Aksi Bersih Pantai Losari');
  cy.contains(fr33Activities.cleanup).click();
  cy.url().should('match', /\/activities\/[^/]+$/);
  cy.contains(fr33Activities.cleanup, { timeout: 30000 }).should('be.visible');
}
