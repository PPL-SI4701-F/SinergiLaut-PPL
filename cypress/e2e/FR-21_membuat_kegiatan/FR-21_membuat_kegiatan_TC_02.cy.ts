describe('FR-21: Membuat Kegiatan Baru oleh Komunitas', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // comm1
    });
    it('Harus menampilkan tombol Simpan sebagai Draft dan Ajukan untuk Review', () => {
        cy.visit('/community/dashboard/activities/create');
        cy.wait(1000);

        cy.contains('button', 'Simpan sebagai Draft').should('be.visible');
        cy.contains('button', 'Ajukan untuk Review').should('be.visible');
    });
});
