import { fr08Activity, openFR08Activity, openVolunteerForm } from './fr08.helpers';

describe('FR-08: Pendaftaran relawan', () => {
  beforeEach(() => {
    openFR08Activity();
  });

  it('TC-FR08-001 - Harus menampilkan form pendaftaran relawan untuk volunteer terverifikasi', () => {
    openVolunteerForm();

    cy.contains(fr08Activity.title).should('be.visible');
    cy.get('input[placeholder="Nama lengkap"]').should('be.visible');
    cy.get('input[placeholder="Umur (tahun)"]').should('be.visible');
    cy.get('input[placeholder="+62 8xx xxxx xxxx"]').should('be.visible');
    cy.get('#agreed').should('be.visible');
    cy.contains('button', 'Daftar Sebagai Relawan').should('be.disabled');
  });
});
