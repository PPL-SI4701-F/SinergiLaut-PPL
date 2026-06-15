describe('FR-21: Membuat Kegiatan Baru oleh Komunitas', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // comm1
    });
    it('Harus mengizinkan komunitas mengisi form kegiatan dengan data yang valid', () => {
        cy.visit('/community/dashboard/activities/create');
        cy.wait(1000);

        cy.get('input#title').type('Bersih Pantai Ancol');
        cy.get('select#category').select(1);
        cy.get('textarea#description').type('Kegiatan membersihkan sampah plastik di sepanjang Pantai Ancol bersama relawan.');
        cy.get('input#location').type('Pantai Ancol, Jakarta');
        cy.get('input#volunteerQuota').type('30');
        cy.get('input#fundingGoal').type('5000000');

        cy.get('input#title').should('have.value', 'Bersih Pantai Ancol');
        cy.get('input#location').should('have.value', 'Pantai Ancol, Jakarta');
        cy.get('input#volunteerQuota').should('have.value', '30');
        cy.get('input#fundingGoal').should('have.value', '5000000');
    });
});
