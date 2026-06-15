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
    // ─────────────────────────────────────────────
    // TC Tambahan: Upload Bukti Dokumentasi dan Submit
    // ─────────────────────────────────────────────
    it('Harus bisa mengunggah file bukti dokumentasi dan laporan berubah status jadi submitted', () => {
                cy.task('getActivityIdByTitle', 'Survei Populasi Ikan Karang Wakatobi').then((id) => cy.visit(`/community/dashboard/activities/${id}/report`));
        cy.wait(1000);
        cy.get('input[id="title"]').type('Laporan Lengkap');
        cy.get('textarea[id="summary"]').type('Dengan bukti nota.');

        // Simulasi upload file (menggunakan stub/mock file yang valid)
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('file contents'),
            fileName: 'bukti.jpg',
            mimeType: 'image/jpeg'
        }, { force: true });

        cy.contains('button', /Kirim|Submit|Ajukan/i).click();
        cy.wait(500);
        cy.contains(/Berhasil/i).should('be.visible');

        // Verifikasi bahwa status laporan adalah 'submitted'
        cy.contains(/Submitted|Diajukan/i).should('be.visible');
    });
});
