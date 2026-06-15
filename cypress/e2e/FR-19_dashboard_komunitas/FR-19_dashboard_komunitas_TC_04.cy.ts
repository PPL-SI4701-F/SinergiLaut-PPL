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
    it('Harus menampilkan sub-informasi rincian kegiatan pada kartu Total Kegiatan', () => {
        cy.visit('/community/dashboard');
        cy.wait(1000);

        cy.contains('Total Kegiatan').parents('.p-5').within(() => {
            cy.contains('terlaksana').should('be.visible');
            cy.contains('aktif').should('be.visible');
            cy.contains('menunggu verifikasi').should('be.visible');
        });
    });
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
    // =====================================================
    // KOMBINASI PENCARIAN + FILTER
    // =====================================================
    // =====================================================
    // KONTROL AKSES
    // =====================================================
});
