export const fr06Admin = {
  email: 'admin1@sinergilaut.id',
  password: 'Password@2026',
};

export const fr06Activities = {
  approvePending: 'FR06 Edukasi Lingkungan Laut untuk Pelajar SD',
  rejectPending: 'FR06 Pemantauan Terumbu Karang Amed',
  published: 'FR06 Bersih Pantai Kuta',
  completed: 'FR06 Restorasi Terumbu Karang Selesai',
};

export function loginAsFR06Admin() {
  cy.task('resetFR06Data');
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.login(fr06Admin.email, fr06Admin.password);
}

export function visitAdminActivities() {
  cy.visit('/admin/activities');
  cy.contains('Kelola Kegiatan', { timeout: 30000 }).should('be.visible');
}

export function activityCard(title: string) {
  return cy.contains(title, { timeout: 30000 }).closest('div.p-4');
}

export function expectFR06ActivityStatus(title: string, status: string) {
  cy.task('getFR06ActivityByTitle', title).then((activity: any) => {
    expect(activity, `${title} exists in Supabase testing`).to.not.equal(null);
    expect(activity.status).to.equal(status);
  });
}
