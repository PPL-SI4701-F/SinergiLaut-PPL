describe('FR-27: Persetujuan Pendaftar Relawan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner3@example.com', 'Password@2026'); // comm3
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
    it('Harus menampilkan empty state saat tidak ada relawan yang mendaftar', () => {
                cy.task('getActivityIdByTitle', 'Edukasi Pesisir untuk Anak Lombok').then((id) => cy.visit(`/community/dashboard/activities/${id}/volunteers`));
        cy.wait(1000);

        // Should show zero-state UI, not crash
        cy.get('main').contains(/belum ada|tidak ada|no volunteer|kosong|empty/i).should('be.visible');
    });

    // ─────────────────────────────────────────────
    // New: Detail relawan pending tampil lengkap
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // New: Tombol aksi tersedia untuk setiap relawan pending
    // ─────────────────────────────────────────────
});
