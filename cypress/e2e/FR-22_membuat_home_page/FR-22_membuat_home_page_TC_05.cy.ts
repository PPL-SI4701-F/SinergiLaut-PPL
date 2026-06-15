describe('FR-22: Halaman Beranda (Home Page)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('Harus menampilkan bagian kegiatan unggulan atau pesan kosong jika belum ada kegiatan', () => {
        cy.visit('/');
        cy.wait(1000);

        cy.contains('Kegiatan Konservasi Terbaru').should('be.visible');
        cy.get('body').then($body => {
            const hasActivities = $body.find('.sl-act-card').length > 0;
            if (!hasActivities) {
                cy.contains('Belum ada kegiatan yang dipublikasikan.').should('be.visible');
            } else {
                cy.get('.sl-act-card').first().should('be.visible');
            }
        });
    });
});
