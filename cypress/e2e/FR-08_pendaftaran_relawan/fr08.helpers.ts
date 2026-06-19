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
  const fillInput = (selector: string, value: string) => {
    cy.get(selector).should('be.visible').and('be.enabled').clear();
    cy.get(selector).should('be.visible').and('be.enabled').type(value);
  };

  fillInput('input[placeholder="Nama lengkap"]', name);
  fillInput('input[placeholder="Umur (tahun)"]', age);
  fillInput('input[placeholder="+62 8xx xxxx xxxx"]', phone);

  if (agree) {
    cy.get('#agreed').check({ force: true });
  }
}
