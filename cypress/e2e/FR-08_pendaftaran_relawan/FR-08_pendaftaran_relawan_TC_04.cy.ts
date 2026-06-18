import { fillVolunteerForm, openFR08Activity, openVolunteerForm } from './fr08.helpers';

describe('FR-08: Pendaftaran relawan', () => {
  beforeEach(() => {
    openFR08Activity();
  });

  it('TC-FR08-004 - Harus menolak nomor telepon yang mengandung huruf', () => {
    openVolunteerForm();
    fillVolunteerForm({ name: 'John Doe', age: '25', phone: 'abcdef1234' });

    cy.contains('button', 'Daftar Sebagai Relawan').click({ force: true });
    cy.get('input[placeholder="+62 8xx xxxx xxxx"]').then(($input) => {
      expect(($input[0] as HTMLInputElement).validity.valid).to.equal(false);
    });
  });
});
