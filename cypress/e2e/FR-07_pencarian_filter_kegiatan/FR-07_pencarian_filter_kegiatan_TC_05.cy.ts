describe('FR-07: Pencarian dan Filter Kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Halaman ini publik, namun kita login sebagai user biasa agar konsisten.
        // Data diambil dari database asli tanpa mock.
        cy.login('approved1@user.com', 'Password@2026');
    });
    it('Harus dapat mereset filter kembali ke kondisi semula', () => {
        cy.visit('/activities');
        cy.wait('@getAllActivities');

        cy.contains('.act-dropdown-btn', /Location/i).click();
        cy.contains('.act-dropdown-item', 'NTB').click();
        cy.contains('Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').should('not.exist');

        cy.contains('.act-dropdown-btn', 'NTB').click();
        cy.contains('.act-dropdown-item', 'All Locations').click();

        cy.contains('Edukasi Pesisir untuk Anak Lombok').should('be.visible');
        cy.contains('Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').should('be.visible');
        cy.contains('Rehabilitasi Terumbu Karang Menjangan').should('be.visible');
    });
});
