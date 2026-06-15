describe('FR-31: Pelaporan Penggunaan Dana dan Dokumentasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner2@example.com', 'Password@2026'); // comm2
    });

    it('Harus mengizinkan komunitas mengirimkan laporan', () => {
        // Asumsi rute pelaporan
        cy.task('getActivityIdByTitle', 'Survei Populasi Ikan Karang Wakatobi').then((id) => cy.visit(`/community/dashboard/activities/${id}/report`));

        // Tunggu hidrasi Next.js selesai sepenuhnya
        cy.wait(1000);



        cy.get('input[id="title"]').type('Laporan Kegiatan Bersih Pantai');
        cy.get('textarea[id="summary"]').type('Semua berjalan lancar.');

        // Upload struk atau tambah item (optional depending on exact UI)
        // cy.get('input[type="file"]').selectFile('cypress/fixtures/struk.png');

        cy.contains('button', /Kirim|Submit|Ajukan/i).click();

        cy.wait(500); // Wait for optimistic update
        cy.contains(/Berhasil|Sukses|diajukan/i).should('be.visible');
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
});
