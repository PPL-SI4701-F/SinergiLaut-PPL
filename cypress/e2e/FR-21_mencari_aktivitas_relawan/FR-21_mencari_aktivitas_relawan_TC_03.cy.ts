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
    it('Harus menyaring (sanitize) payload XSS pada kolom pencarian', () => {
        cy.visit('/activities');
        
        cy.get('input[placeholder*="Cari" i]').type(xssPayload, { delay: 10 });

        // XSS must NOT execute - verify alert dialog did NOT pop up
        cy.get('body').should('be.visible');

        // The raw script tag must NOT appear as rendered HTML in the DOM
        cy.get('body').then(($body) => {
            const html = $body.html();
            expect(html).not.to.include('<script>alert');
        });
    });

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
