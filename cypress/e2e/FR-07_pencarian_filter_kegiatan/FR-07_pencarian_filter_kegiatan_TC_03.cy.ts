describe('FR-07: Pencarian dan Filter Kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Halaman ini publik, namun kita login sebagai user biasa agar konsisten.
        // Data diambil dari database asli tanpa mock.
        cy.login('approved1@user.com', 'Password@2026');
    });
    it('Harus dapat menyaring kegiatan berdasarkan tipe/kategori melalui dropdown', () => {
        cy.visit('/activities');
        cy.wait('@getAllActivities');

        cy.contains('.act-dropdown-btn', /Type/i).click();
        cy.contains('.act-dropdown-item', /Coral & ecosystem restoration/i).click();

        cy.contains('Edukasi Pesisir untuk Anak Lombok').should('not.exist');
        cy.contains('Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').should('not.exist');
        cy.contains('Rehabilitasi Terumbu Karang Menjangan').should('be.visible');
    });
});
