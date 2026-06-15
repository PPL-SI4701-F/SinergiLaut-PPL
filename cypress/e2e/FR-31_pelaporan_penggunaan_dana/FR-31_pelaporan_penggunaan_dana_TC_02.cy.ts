describe('FR-31: Pelaporan Penggunaan Dana dan Dokumentasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner2@example.com', 'Password@2026'); // comm2
    });
    // ─────────────────────────────────────────────
    // Edge Case 1: Submit laporan kosong (empty form)
    // ─────────────────────────────────────────────
    it('Harus memblokir pengiriman saat judul atau ringkasan laporan kosong', () => {
        cy.setCookie('e2e-bypass-auth', 'community-empty'); // Use community-empty to start with no report
        cy.task('getActivityIdByTitle', 'Survei Populasi Ikan Karang Wakatobi').then((id) => cy.visit(`/community/dashboard/activities/${id}/report`));
        cy.wait(1000);



        // Leave title and summary empty, try to submit (Simpan Draft)
        cy.contains('button', /Simpan Draft/i).click();

        cy.contains(/wajib diisi/i).should('be.visible');
    });

    // ─────────────────────────────────────────────
    // Edge Case 2: Submit laporan dengan hanya spasi
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // TC Tambahan: Simpan Draft
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // TC Tambahan: Upload Bukti Dokumentasi dan Submit
    // ─────────────────────────────────────────────
});
