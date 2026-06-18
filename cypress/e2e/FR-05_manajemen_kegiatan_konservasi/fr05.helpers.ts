export const fr05User = {
  email: 'owner1@example.com',
  password: 'Password@2026',
};

export const fr05Activities = {
  published: 'Bersih Pantai Kuta',
  draft: 'Rencana Bersih Pantai Sanur',
  pendingReview: 'Edukasi Lingkungan Laut untuk Pelajar SD',
  pendingReviewAlt: 'Pemantauan Terumbu Karang Amed',
  cancelled: 'Festival Laut Nusantara 2026',
  completed: 'Ekspedisi Terumbu Karang Raja Ampat',
  otherCommunity: 'Kegiatan Komunitas Lain FR05',
};

export function loginAsFR05Community() {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.login(fr05User.email, fr05User.password);
}

export function visitCommunityDashboard() {
  cy.visit('/community/dashboard');
  cy.contains('Kelola Kegiatan', { timeout: 30000 }).should('be.visible');
}

export function activityCard(title: string) {
  return cy.contains(title, { timeout: 30000 }).closest('.border-border');
}
