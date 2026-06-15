describe('FR-19: Dashboard Komunitas', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.setCookie('e2e-bypass-auth', 'community');
    });

    // =====================================================
    // HEADER & STATUS VERIFIKASI
    // =====================================================
    // =====================================================
    // KARTU STATISTIK
    // =====================================================
    // =====================================================
    // SECTION KELOLA KEGIATAN - HEADER & TOMBOL
    // =====================================================
    // =====================================================
    // DAFTAR KEGIATAN - SEMUA STATUS
    // =====================================================
    // =====================================================
    // TOMBOL AKSI PER KARTU KEGIATAN
    // =====================================================
    it('Harus menampilkan tombol Edit (link langsung ke /edit) untuk kegiatan berstatus Draft', () => {
        cy.visit('/community/dashboard');
        cy.wait(1000);

        cy.contains('Rehabilitasi Terumbu Karang Menjangan').parents('.border-border').within(() => {
            cy.contains('a', 'Edit')
                .should('have.attr', 'href')
                .and('include', '/edit');
        });
    });
    // =====================================================
    // FITUR PENCARIAN
    // =====================================================
    // =====================================================
    // FITUR FILTER STATUS
    // =====================================================
    // =====================================================
    // KOMBINASI PENCARIAN + FILTER
    // =====================================================
    // =====================================================
    // KONTROL AKSES
    // =====================================================
});
