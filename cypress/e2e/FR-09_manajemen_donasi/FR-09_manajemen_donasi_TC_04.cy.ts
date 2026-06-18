import {
  fr09Activity,
  loginAsFR09CommunityOwner,
} from './fr09.helpers';

describe('FR-09: Manajemen donasi oleh komunitas', () => {
  beforeEach(() => {
    loginAsFR09CommunityOwner();
  });

  it('TC-FR09-004 - Komunitas dapat memantau donasi yang masuk', () => {
    cy.visit('/community/dashboard');

    cy.contains('Kelola Kegiatan').should('be.visible');
    cy.contains(fr09Activity.title)
      .parents('.border-border')
      .first()
      .within(() => {
        cy.contains(/Rp\s*350\.000/).should('be.visible');
        cy.contains('button, a', /Kelola/i).should('be.visible');
      });
  });
});
