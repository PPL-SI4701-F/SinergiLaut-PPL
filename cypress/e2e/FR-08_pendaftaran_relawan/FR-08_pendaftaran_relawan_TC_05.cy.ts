import { fillVolunteerForm, openFR08Activity, openVolunteerForm } from './fr08.helpers';

describe('FR-08: Pendaftaran relawan', () => {
  beforeEach(() => {
    openFR08Activity();
  });

  it('TC-FR08-005 - Harus menolak nomor telepon yang terlalu pendek', () => {
    openVolunteerForm();
    fillVolunteerForm({ name: 'Budi Pendek', age: '22', phone: '08123' });

    cy.contains('button', 'Daftar Sebagai Relawan').click({ force: true });
    cy.contains('Nomor telepon terlalu pendek (minimal 10 digit).').should('be.visible');
    cy.get('input[placeholder="+62 8xx xxxx xxxx"]').should('have.value', '08123');
    cy.task('getFR08Registration').should('equal', null);
  });
});
