describe('FR-27: Persetujuan Pendaftar Relawan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // comm1
    });
    // ─────────────────────────────────────────────
    // Edge Case 1: Kuota penuh - Setujui relawan ke-51
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // Edge Case 2: Kuota tersedia - Persetujuan normal berhasil
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // Edge Case 3: Penolakan relawan (negative path)
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // Edge Case 4: Daftar relawan kosong (zero state)
    // Override beforeEach intercept di dalam test untuk mengembalikan array kosong
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // New: Detail relawan pending tampil lengkap
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // New: Tombol aksi tersedia untuk setiap relawan pending
    // ─────────────────────────────────────────────
    it('Harus menampilkan tombol Terima dan Tolak untuk setiap relawan yang masih berstatus pending', () => {
        cy.task('getActivityIdByTitle', 'Rehabilitasi Terumbu Karang Menjangan').then((id) => cy.visit(`/community/dashboard/activities/${id}/volunteers`));
        cy.wait(1000);

        // Both action buttons must be available for the first pending volunteer
        cy.contains('Dian Rahmawati')
            .parents('div.border, tr, .card, li')
            .first()
            .within(() => {
                cy.contains(/Terima|Approve|Setujui/i).should('be.visible');
                cy.contains(/Tolak|Reject/i).should('be.visible');
            });
    });
});
