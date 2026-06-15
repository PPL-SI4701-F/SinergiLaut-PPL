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
    it('Harus menampilkan badge status yang sesuai pada setiap kartu kegiatan', () => {
        cy.visit('/community/dashboard');
        cy.wait(1000);

        cy.contains('Bersih Pantai Kuta').parents('.border-border').within(() => {
            cy.contains('Aktif').should('be.visible');
        });
        cy.contains('Rehabilitasi Terumbu Karang Menjangan').parents('.border-border').within(() => {
            cy.contains('Draft').should('be.visible');
        });
        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD').parents('.border-border').within(() => {
            cy.contains('Menunggu Review').should('be.visible');
        });
        cy.contains('Ekspedisi Terumbu Karang Raja Ampat').parents('.border-border').within(() => {
            cy.contains('Selesai').should('be.visible');
        });
        cy.contains('Festival Laut Nusantara 2026').parents('.border-border').within(() => {
            cy.contains('Dibatalkan').should('be.visible');
        });
    });
    // =====================================================
    // TOMBOL AKSI PER KARTU KEGIATAN
    // =====================================================
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
