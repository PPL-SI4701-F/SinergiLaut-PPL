import { fillVolunteerForm, fr08Activity, fr08User, openFR08Activity, openVolunteerForm } from './fr08.helpers';

describe('FR-08: Pendaftaran relawan', () => {
  beforeEach(() => {
    openFR08Activity();
  });

  it('TC-FR08-007 - Harus berhasil mendaftar sebagai relawan dan tersimpan di database', () => {
    openVolunteerForm();
    fillVolunteerForm();

    cy.contains('button', 'Daftar Sebagai Relawan').click();
    cy.contains(/Pendaftaran berhasil|Tunggu konfirmasi/i).should('be.visible');

    cy.task('getFR08Registration').then((registration: any) => {
      expect(registration, 'volunteer registration row exists in Supabase testing').to.not.equal(null);
      expect(registration.fullName).to.equal(fr08User.fullName);
      expect(registration.email).to.equal(fr08User.email);
      expect(registration.phone).to.equal(fr08User.phone);
      expect(registration.reason).to.equal('Umur: 25 tahun');
      expect(registration.agreedToTerms).to.equal(true);
      expect(registration.status).to.equal('pending');
      expect(registration.activityTitle).to.equal(fr08Activity.title);
    });
  });
});
