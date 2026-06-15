describe('FR-07: Pencarian dan Filter Kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Halaman ini publik, namun kita login sebagai user biasa agar konsisten.
        // Data diambil dari database asli tanpa mock.
        cy.login('approved1@user.com', 'Password@2026');
    });

    it('Harus menampilkan halaman kegiatan dengan kolom pencarian dan dropdown filter', () => {
        cy.visit('/activities');
        cy.wait('@getAllActivities');

        cy.get('input[placeholder*="Cari" i]').should('be.visible');
        cy.contains('.act-dropdown-btn', /Location/i).should('be.visible');
        cy.contains('.act-dropdown-btn', /Type/i).should('be.visible');

        cy.contains('Edukasi Pesisir untuk Anak Lombok').should('be.visible');
        cy.contains('Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').should('be.visible');
        cy.contains('Rehabilitasi Terumbu Karang Menjangan').should('be.visible');
    });
});
