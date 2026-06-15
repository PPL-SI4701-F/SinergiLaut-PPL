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
    it('Harus menangani percobaan SQL injection pada input pencarian dengan aman', () => {
        cy.visit('/activities');
        
        cy.get('input[placeholder*="Cari" i]').type(sqlPayload, { delay: 10 });

        // Application must NOT crash or expose internal error
        cy.get('body').should('be.visible');
        cy.contains(/error|exception|syntax error|invalid/i).should('not.exist');

        // No results should show for SQL payload
        cy.contains('Bersih Pantai Kuta').should('not.exist');
        cy.contains('Transplantasi Karang Takabonerate').should('not.exist');
    });

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
});
