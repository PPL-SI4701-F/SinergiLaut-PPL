describe('FR-21: Mencari dan Mendaftar Aktivitas Relawan', () => {
    const xssPayload = '<script>alert("xss")</script>';
    const sqlPayload = "' OR 1=1 --";
    const wildcardPayload = '% _ LIKE SELECT DROP';

    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.setCookie('e2e-bypass-auth', 'user');

            });
    // ─────────────────────────────────────────────
    // Edge Case 1: Pencarian dengan karakter SQL Injection
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // Edge Case 2: Pencarian dengan XSS payload
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // Edge Case 3: Pencarian wildcard/karakter khusus SQL
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // Edge Case 4: Pencarian kosong menampilkan semua data
    // ─────────────────────────────────────────────
    it('Harus menampilkan semua kegiatan saat pencarian dikosongkan', () => {
        cy.visit('/activities');
        
        const searchInput = cy.get('input[placeholder*="Cari" i]');
        searchInput.type('Bersih');
        cy.contains('Transplantasi Karang Takabonerate').should('not.exist');

        // Clear the search
        cy.get('input[placeholder*="Cari" i]').clear();

        // All activities should be visible again
        cy.contains('Bersih Pantai Kuta').should('be.visible');
        cy.contains('Transplantasi Karang Takabonerate').should('be.visible');
    });

    // ─────────────────────────────────────────────
    // Edge Case 5: Pencarian keyword random tanpa hasil
    // ─────────────────────────────────────────────
});
