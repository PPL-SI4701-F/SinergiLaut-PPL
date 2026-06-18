import { fillVolunteerForm, openFR08Activity, openVolunteerForm } from './fr08.helpers';

describe('FR-08: Pendaftaran relawan', () => {
  beforeEach(() => {
    openFR08Activity();
  });

  it('TC-FR08-002 - Harus menolak umur di bawah batas minimum', () => {
    openVolunteerForm();
    fillVolunteerForm({ name: 'Anak Kecil', age: '5', phone: '081234567890' });

    cy.contains('button', 'Daftar Sebagai Relawan').click({ force: true });
    cy.get('input[placeholder="Umur (tahun)"]').then(($input) => {
      expect(($input[0] as HTMLInputElement).validity.valid).to.equal(false);
    });
  });
});
