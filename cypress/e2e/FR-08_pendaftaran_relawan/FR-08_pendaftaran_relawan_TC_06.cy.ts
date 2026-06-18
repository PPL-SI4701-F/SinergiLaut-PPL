import { fillVolunteerForm, openFR08Activity, openVolunteerForm } from './fr08.helpers';

describe('FR-08: Pendaftaran relawan', () => {
  beforeEach(() => {
    openFR08Activity();
  });

  it('TC-FR08-006 - Harus menonaktifkan submit saat syarat dan ketentuan belum disetujui', () => {
    openVolunteerForm();
    fillVolunteerForm({ name: 'Siti Aminah', age: '23', phone: '081234567890', agree: false });

    cy.contains('button', 'Daftar Sebagai Relawan').should('be.disabled');
    cy.task('getFR08Registration').should('equal', null);
  });
});
