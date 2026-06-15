describe('FR-21: Membuat Kegiatan Baru oleh Komunitas', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // comm1
    });
    it('Harus menampilkan opsi donasi barang ketika checkbox "Terima Donasi Barang" dicentang', () => {
        cy.visit('/community/dashboard/activities/create');
        cy.wait(1000);

        cy.get('input#allowItemDonation').check({ force: true });
        cy.get('input#allowItemDonation').should('be.checked');
    });
});
