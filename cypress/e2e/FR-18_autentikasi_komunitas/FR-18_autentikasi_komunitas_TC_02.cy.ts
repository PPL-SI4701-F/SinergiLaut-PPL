describe('FR-18: Autentikasi & Pendaftaran Akun Komunitas', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('Harus menampilkan field informasi komunitas dan kontak admin pada langkah 1', () => {
        cy.visit('/community/register');
        cy.wait(1000);

        cy.get('input[placeholder="contoh: Ocean Guardians Indonesia"]').should('be.visible');
        cy.get('textarea[placeholder*="Deskripsikan misi dan kegiatan komunitas"]').should('be.visible');
        cy.get('input[placeholder="Nama lengkap administrator"]').should('be.visible');
        cy.get('input[placeholder="admin@community.org"]').should('be.visible');
        cy.get('input[placeholder="+62 812 3456 7890"]').should('be.visible');
        cy.get('input[placeholder="Minimal 8 karakter"]').should('be.visible');
        cy.get('input[placeholder="Ulangi password"]').should('be.visible');
    });
});
