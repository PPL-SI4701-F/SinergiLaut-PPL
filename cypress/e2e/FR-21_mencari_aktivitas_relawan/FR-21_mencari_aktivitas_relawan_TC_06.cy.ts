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
    // ─────────────────────────────────────────────
    // Edge Case 5: Pencarian keyword random tanpa hasil
    // ─────────────────────────────────────────────
    it('Harus menampilkan kondisi kosong saat pencarian tidak menghasilkan apa pun', () => {
        cy.visit('/activities');
        
        cy.get('input[placeholder*="Cari" i]').type('xqyzw123nonexistent');

        // Neither activity should be visible
        cy.contains('Bersih Pantai Kuta').should('not.exist');
        cy.contains('Transplantasi Karang Takabonerate').should('not.exist');

        // Should show empty/no-result state message
        cy.contains(/tidak ditemukan|tidak ada|no result|belum ada/i).should('be.visible');
    });
});
