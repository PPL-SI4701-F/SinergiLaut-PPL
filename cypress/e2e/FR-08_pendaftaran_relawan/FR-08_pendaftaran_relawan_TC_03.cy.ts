import { fillVolunteerForm, openFR08Activity, openVolunteerForm } from './fr08.helpers';

describe('FR-08: Pendaftaran relawan', () => {
  beforeEach(() => {
    openFR08Activity();
  });

  it('TC-FR08-003 - Harus menolak umur yang melebihi batas maksimal', () => {
    openVolunteerForm();
    fillVolunteerForm({ name: 'Usia Tidak Valid', age: '999', phone: '081234567890' });

    cy.contains('button', 'Daftar Sebagai Relawan').click({ force: true });
    cy.get('input[placeholder="Umur (tahun)"]').then(($input) => {
      expect(($input[0] as HTMLInputElement).validity.valid).to.equal(false);
    });
  });
});
