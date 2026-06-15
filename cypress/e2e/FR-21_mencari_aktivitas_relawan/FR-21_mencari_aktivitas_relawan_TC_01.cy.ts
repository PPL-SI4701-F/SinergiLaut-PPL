describe('FR-21: Mencari dan Mendaftar Aktivitas Relawan', () => {
    const xssPayload = '<script>alert("xss")</script>';
    const sqlPayload = "' OR 1=1 --";
    const wildcardPayload = '% _ LIKE SELECT DROP';

    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.setCookie('e2e-bypass-auth', 'user');

            });

    it('Harus mengizinkan pengguna mencari dan menyaring kegiatan menggunakan pencarian teks dan dropdown', () => {
        cy.visit('/activities');
        
        // Both should be visible initially
        cy.contains('Bersih Pantai Kuta').should('be.visible');
        cy.contains('Transplantasi Karang Takabonerate').should('be.visible');

        // 1. Text Search for "Bersih"
        cy.get('input[placeholder*="Cari" i]').type('Bersih');
        cy.contains('Transplantasi Karang Takabonerate').should('not.exist');
        cy.contains('Bersih Pantai Kuta').should('be.visible');

        // Clear search
        cy.get('input[placeholder*="Cari" i]').clear();
        cy.contains('Transplantasi Karang Takabonerate').should('be.visible');

        // 2. Dropdown Filter: Location filter (Jakarta)
        cy.contains('.act-dropdown-btn', /Location/i).click();
        cy.contains('.act-dropdown-item', 'Sulawesi Selatan').click();
        cy.contains('Transplantasi Karang Takabonerate').should('not.exist');
        cy.contains('Bersih Pantai Kuta').should('be.visible');

        // Reset location filter back to "All Locations"
        cy.contains('.act-dropdown-btn', 'Sulawesi Selatan').click();
        cy.contains('.act-dropdown-item', 'All Locations').click();
        cy.contains('Transplantasi Karang Takabonerate').should('be.visible');

        // 3. Dropdown Filter: Category/Type filter (Coral & Ecosystem Restoration)
        cy.contains('.act-dropdown-btn', /Type/i).click();
        cy.contains('.act-dropdown-item', 'Coral_restoration').click();
        cy.contains('Bersih Pantai Kuta').should('not.exist');
        cy.contains('Transplantasi Karang Takabonerate').should('be.visible');
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
});
