describe('FR-27: Persetujuan Pendaftar Relawan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // comm1
    });

    it('Harus mengizinkan komunitas menyetujui atau menolak relawan', () => {
        cy.task('getActivityIdByTitle', 'Rehabilitasi Terumbu Karang Menjangan').then((id) => cy.visit(`/community/dashboard/activities/${id}/volunteers`));
        cy.wait(1000);

        // Action Reject
        cy.contains('Dian Rahmawati').parents('div.border, tr, .card, li').find('button').contains(/Tolak|Reject/i).click();
        cy.wait(500); // Wait for optimistic update or mock
        cy.contains('Dian Rahmawati').parents('div.border').contains(/Ditolak|Rejected/i).should('be.visible');

        // Action Approve
        cy.contains('Fajar Nugroho').parents('div.border, tr, .card, li').find('button').contains(/Terima|Approve|Setujui/i).click();
        cy.wait(500); // Wait for optimistic update or mock
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
});
