describe('FR-27: Persetujuan Pendaftar Relawan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner2@example.com', 'Password@2026'); // comm2
    });
    // ─────────────────────────────────────────────
    // Edge Case 1: Kuota penuh - Setujui relawan ke-51
    // ─────────────────────────────────────────────
    it('Should block approval when volunteer quota is already full', () => {
        cy.task('getActivityIdByTitle', 'Transplantasi Karang Takabonerate').then((id) => cy.visit(`/community/dashboard/activities/${id}/volunteers`));

        // Wait for the mock activity data to load on the page.
        // If this times out, it means the server mock did not return 1/1 for act-full!
        cy.contains('1/1', { timeout: 15000 }).should('be.visible');

        // Wait for the volunteer data to load
        cy.contains('Andi Pratama', { timeout: 15000 }).should('be.visible');

        // The button must now be disabled because isQuotaFull is true
        cy.contains('Andi Pratama')
            .parents('div.border, tr, .card, li')
            .contains('button', /Terima|Approve|Setujui/i)
            .should('be.disabled');
    });

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
