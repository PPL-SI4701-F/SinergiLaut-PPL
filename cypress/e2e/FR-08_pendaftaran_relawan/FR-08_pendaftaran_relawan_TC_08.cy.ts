import { prepareFR08Data, visitFR08ActivityAsVolunteer } from './fr08.helpers';

describe('FR-08: Pendaftaran relawan', () => {
  it('TC-FR08-008 - Harus mencegah pendaftaran duplikat pada kegiatan yang sama', () => {
    prepareFR08Data();
    cy.task('seedFR08ExistingRegistration');
    visitFR08ActivityAsVolunteer();

    cy.contains('button', 'Daftar Relawan').click({ force: true });
    cy.contains('Anda Sudah Terdaftar!').should('be.visible');
    cy.contains('pending').should('be.visible');
    cy.contains('button', 'Daftar Sebagai Relawan').should('not.exist');
  });
});
