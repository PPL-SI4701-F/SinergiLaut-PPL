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
    // ─────────────────────────────────────────────
    // TC Tambahan: Simpan Draft
    // ─────────────────────────────────────────────
    it('Harus bisa menyimpan laporan sebagai draft tanpa men-submit ke admin', () => {
                cy.task('getActivityIdByTitle', 'Survei Populasi Ikan Karang Wakatobi').then((id) => cy.visit(`/community/dashboard/activities/${id}/report`));
        cy.wait(1000);
        cy.get('input[id="title"]').type('Draft Laporan');
        cy.get('textarea[id="summary"]').type('Ini baru draft');
        cy.contains('button', /Simpan Draft/i).click();

        // Asumsi UI menampilkan toast atau mengubah badge status menjadi draft
        cy.contains(/Draft disimpan|Berhasil/i).should('be.visible');
    });

    // ─────────────────────────────────────────────
    // TC Tambahan: Upload Bukti Dokumentasi dan Submit
    // ─────────────────────────────────────────────
});
