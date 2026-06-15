describe('FR-15: Monitoring progress kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // Can be any user/community to see progress
    });
    it('Harus menampilkan elemen progress bar pada halaman detail kegiatan', () => {
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').then((id) => {
            cy.visit(`/activities/${id}`);
        });

        // Verifikasi bahwa elemen yang berfungsi sebagai bar progress (misal <progress>, div ber-role progressbar, atau class yg spesifik) ditampilkan.
        cy.get(
            'progress, [role="progressbar"], .progress, .progress-bar, [class*="progress"], [class*="w-full bg-slate"]',
        ).should('exist');
    });
});