describe('FR-21: Membuat Kegiatan Baru oleh Komunitas', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // comm1
    });

    it('Harus menampilkan halaman pembuatan kegiatan dengan form lengkap', () => {
        cy.visit('/community/dashboard/activities/create');
        cy.wait(1000);

        cy.contains('h1', 'Buat Kegiatan Baru').should('be.visible');
        cy.contains('Kegiatan akan direview admin sebelum dipublikasikan').should('be.visible');

        cy.get('input#title').should('be.visible');
        cy.get('select#category').should('be.visible');
        cy.get('textarea#description').should('be.visible');
        cy.get('input#startDate').should('be.visible');
        cy.get('input#executionDate').should('be.visible');
        cy.get('input#location').should('be.visible');
        cy.get('input#volunteerQuota').should('be.visible');
        cy.get('input#fundingGoal').should('be.visible');
    });
});
