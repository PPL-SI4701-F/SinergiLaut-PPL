describe('FR-21: Membuat Kegiatan Baru oleh Komunitas', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // comm1
    });
    it('Harus menampilkan validasi saat tanggal pelaksanaan kurang dari 1 bulan dari sekarang', () => {
        cy.visit('/community/dashboard/activities/create');
        cy.wait(1000);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const offset = tomorrow.getTimezoneOffset() * 60000;
        const tomorrowLocal = new Date(tomorrow.getTime() - offset).toISOString().slice(0, 16);

        const today = new Date();
        const todayOffset = today.getTimezoneOffset() * 60000;
        const todayLocal = new Date(today.getTime() - todayOffset).toISOString().slice(0, 16);

        cy.get('input#title').type('Bersih Pantai Ancol');
        cy.get('textarea#description').type('Kegiatan membersihkan sampah plastik di sepanjang Pantai Ancol bersama relawan.');
        cy.get('input#location').type('Pantai Ancol, Jakarta');
        cy.get('input#volunteerQuota').type('30');
        cy.get('input#fundingGoal').type('5000000');

        cy.get('input#startDate').type(todayLocal);
        cy.get('input#executionDate').type(tomorrowLocal);

        cy.get('form').invoke('attr', 'novalidate', 'novalidate');
        cy.contains('button', 'Ajukan untuk Review').click();
        cy.contains('Tanggal Pelaksanaan Kegiatan harus minimal 1 bulan dari sekarang.').should('be.visible');
    });
});
