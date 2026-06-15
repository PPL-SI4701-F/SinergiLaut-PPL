describe('FR-12: Verifikasi Pengguna (/admin/users)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus dapat menolak verifikasi pengguna', () => {
        cy.contains('button', 'Menunggu').first().click();
        cy.wait(500);
        cy.get('.border-yellow-300').first().find('button').first().click({ force: true });
        cy.contains('Tolak').click();

        // Dialog penolakan muncul, cari textarea alasan
        cy.get('textarea').type('Data tidak valid');
        cy.contains('button', 'Konfirmasi').click();
    });
});
