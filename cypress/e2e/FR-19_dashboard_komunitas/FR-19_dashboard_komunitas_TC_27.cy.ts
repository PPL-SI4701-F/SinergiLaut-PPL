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
    // =====================================================
    // FITUR PENCARIAN
    // =====================================================
    // =====================================================
    // FITUR FILTER STATUS
    // =====================================================
    it('Harus memfilter kegiatan berdasarkan status Aktif', () => {
        cy.visit('/community/dashboard');
        cy.wait(1000);

        cy.get('[role="combobox"]').click();
        cy.contains('[role="option"]', 'Aktif').click();

        cy.contains('Bersih Pantai Kuta').should('be.visible');
        cy.contains('Rehabilitasi Terumbu Karang Menjangan').should('not.exist');
        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD').should('not.exist');
        cy.contains('Ekspedisi Terumbu Karang Raja Ampat').should('not.exist');
    });
    // =====================================================
    // KOMBINASI PENCARIAN + FILTER
    // =====================================================
    // =====================================================
    // KONTROL AKSES
    // =====================================================
});
