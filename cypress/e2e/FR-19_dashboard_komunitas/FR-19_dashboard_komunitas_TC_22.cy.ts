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
    it('Harus memfilter kegiatan sesuai kata kunci yang diketik', () => {
        cy.visit('/community/dashboard');
        cy.wait(1000);

        cy.get('input[placeholder="Cari kegiatan..."]').type('Bersih');

        cy.contains('Bersih Pantai Kuta').should('be.visible');
        cy.contains('Rehabilitasi Terumbu Karang Menjangan').should('not.exist');
        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD').should('not.exist');
        cy.contains('Ekspedisi Terumbu Karang Raja Ampat').should('not.exist');
    });
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
