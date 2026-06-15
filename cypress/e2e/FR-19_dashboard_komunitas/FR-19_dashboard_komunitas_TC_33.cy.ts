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
    // =====================================================
    // KOMBINASI PENCARIAN + FILTER
    // =====================================================

    it('Harus menggabungkan pencarian teks dan filter status secara bersamaan', () => {
        cy.visit('/community/dashboard');
        cy.wait(1000);

        // Filter ke Aktif, lalu cari kata kunci yang tidak ada di kegiatan Aktif
        cy.get('[role="combobox"]').click();
        cy.contains('[role="option"]', 'Aktif').click();

        cy.get('input[placeholder="Cari kegiatan..."]').type('Bersih');
        cy.contains('Bersih Pantai Kuta').should('be.visible');

        cy.get('input[placeholder="Cari kegiatan..."]').clear().type('Mangrove');
        cy.contains('Tidak ada kegiatan ditemukan.').should('be.visible');
    });

    // =====================================================
    // KONTROL AKSES
    // =====================================================
});
