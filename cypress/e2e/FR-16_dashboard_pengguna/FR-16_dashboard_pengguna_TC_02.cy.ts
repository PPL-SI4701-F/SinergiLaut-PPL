describe('FR-16: Dashboard Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved1@user.com', 'Password@2026'); // Dian Rahmawati
    });
    it('Harus menampilkan kartu statistik: kegiatan diikuti, total donasi, dan status aktif', () => {
        cy.visit('/user/dashboard');
        cy.wait(1000);

        cy.contains('Kegiatan Diikuti').should('be.visible');
        cy.contains('Total Donasi').should('be.visible');
        cy.contains('Kegiatan Aktif').should('be.visible');

        // Verify the values are non-empty numbers
        cy.contains('Kegiatan Diikuti')
            .parents('.rounded-2xl')
            .within(() => {
                cy.get('p').eq(1).invoke('text').should('match', /^[0-9]+$/);
            });

        cy.contains('Kegiatan Aktif')
            .parents('.rounded-2xl')
            .within(() => {
                cy.get('p').eq(1).invoke('text').should('match', /^[0-9]+$/);
            });
            
        cy.contains('Total Donasi')
            .parents('.rounded-2xl')
            .within(() => {
                cy.get('p').eq(1).invoke('text').should('match', /^(Rp\s?)?[\d.,]+$/);
            });
    });
});