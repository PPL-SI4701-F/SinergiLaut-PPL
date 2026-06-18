export const fr08User = {
  email: 'fr08.volunteer@test.local',
  password: 'Password@2026',
  fullName: 'Dian Relawan FR08',
  phone: '081234567894',
};

export const fr08Activity = {
  title: 'FR08 Bersih Pantai Volunteer',
};

export function prepareFR08Data() {
  cy.task('resetFR08Data');
}

export function visitFR08ActivityAsVolunteer() {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.login(fr08User.email, fr08User.password);

  cy.task('getFR08Activity').then((activity: any) => {
    expect(activity, 'FR-08 activity seed exists').to.not.equal(null);
    cy.visit(`/activities/${activity.id}`);
  });

  cy.contains(fr08Activity.title, { timeout: 30000 }).should('be.visible');
  cy.contains('button', 'Daftar Relawan').should('be.visible');
}

export function openFR08Activity() {
  prepareFR08Data();
  visitFR08ActivityAsVolunteer();
}

export function openVolunteerForm() {
  cy.contains('button', 'Daftar Relawan').click({ force: true });
  cy.contains('Daftar Sebagai Relawan').should('be.visible');
}

export function fillVolunteerForm({
  name = fr08User.fullName,
  age = '25',
  phone = fr08User.phone,
  agree = true,
} = {}) {
  cy.get('input[placeholder="Nama lengkap"]').clear().type(name);
  cy.get('input[placeholder="Umur (tahun)"]').clear().type(age);
  cy.get('input[placeholder="+62 8xx xxxx xxxx"]').clear().type(phone);

  if (agree) {
    cy.get('#agreed').check({ force: true });
  }
}
