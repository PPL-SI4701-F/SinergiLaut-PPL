describe('FR-31: Pelaporan Penggunaan Dana dan Dokumentasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner2@example.com', 'Password@2026'); // comm2
    });
    // ─────────────────────────────────────────────
    // Edge Case 1: Submit laporan kosong (empty form)
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // Edge Case 2: Submit laporan dengan hanya spasi
    // ─────────────────────────────────────────────
    it('Harus memblokir pengiriman saat judul hanya berisi spasi', () => {
        cy.setCookie('e2e-bypass-auth', 'community-empty'); // Start empty
        cy.task('getActivityIdByTitle', 'Survei Populasi Ikan Karang Wakatobi').then((id) => cy.visit(`/community/dashboard/activities/${id}/report`));
        cy.wait(1000);

        // Fill with whitespace only
        cy.get('input[id="title"]').type('   ');
        cy.get('textarea[id="summary"]').type('   ');
        cy.contains('button', /Simpan Draft/i).click();

        // Error message about required fields
        cy.contains(/wajib diisi/i).should('be.visible');
    });

    // ─────────────────────────────────────────────
    // TC Tambahan: Simpan Draft
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // TC Tambahan: Upload Bukti Dokumentasi dan Submit
    // ─────────────────────────────────────────────
});
