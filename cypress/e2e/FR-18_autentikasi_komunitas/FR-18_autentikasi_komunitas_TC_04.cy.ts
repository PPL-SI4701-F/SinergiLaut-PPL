describe('FR-18: Autentikasi & Pendaftaran Akun Komunitas', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('Harus menampilkan validasi format email yang tidak valid', () => {
        cy.visit('/community/register');
        cy.wait(1000);

        cy.get('input[placeholder="contoh: Ocean Guardians Indonesia"]').type('Ocean Guardians');
        cy.get('textarea[placeholder*="Deskripsikan misi dan kegiatan komunitas"]')
            .type('Komunitas peduli laut dan ekosistem pesisir Indonesia.');
        cy.get('input[placeholder="Nama lengkap administrator"]').type('Admin Test');
        cy.get('input[placeholder="admin@community.org"]').type('emailtidakvalid');
        cy.get('input[placeholder="+62 812 3456 7890"]').type('081234567890');
        cy.get('input[placeholder="Minimal 8 karakter"]').type('ValidPass123!');
        cy.get('input[placeholder="Ulangi password"]').type('ValidPass123!');

        cy.contains('button', 'Lanjut').click();
        cy.contains('Format email tidak valid. Pastikan menggunakan @.').should('be.visible');
    });
});
