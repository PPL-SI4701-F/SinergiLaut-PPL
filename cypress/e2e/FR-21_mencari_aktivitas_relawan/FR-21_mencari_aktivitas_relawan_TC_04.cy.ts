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
    it('Harus menangani karakter wildcard SQL pada pencarian tanpa crash', () => {
        cy.visit('/activities');
        
        cy.get('input[placeholder*="Cari" i]').type(wildcardPayload, { delay: 10 });

        cy.get('body').should('be.visible');
        cy.contains(/error|exception/i).should('not.exist');
    });

    // ─────────────────────────────────────────────
    // Edge Case 4: Pencarian kosong menampilkan semua data
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // Edge Case 5: Pencarian keyword random tanpa hasil
    // ─────────────────────────────────────────────
});
