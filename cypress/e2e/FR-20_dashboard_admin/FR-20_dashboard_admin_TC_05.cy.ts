describe('FR-20: Dashboard Admin', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.setCookie('e2e-bypass-auth', 'admin');
    });

    // =====================================================
    // HEADER
    // =====================================================
    // =====================================================
    // KARTU STATISTIK UTAMA
    // =====================================================
    // =====================================================
    // KARTU RINGKASAN PENDING (ALERT CARDS)
    // =====================================================

    it('Harus menampilkan 4 kartu alert ringkasan item pending', () => {
        cy.visit('/admin/dashboard');
        cy.wait(1000);

        cy.contains('Menunggu verifikasi').should('be.visible');
        cy.contains('Menunggu persetujuan').should('be.visible');
        cy.contains('Menunggu validasi').should('be.visible');
        cy.contains('Menunggu verifikasi data diri').should('be.visible');
    });
    // =====================================================
    // SECTION KOMUNITAS PENDING
    // =====================================================
    // =====================================================
    // SECTION KEGIATAN PENDING
    // =====================================================
    // =====================================================
    // SECTION LAPORAN PENDING
    // =====================================================
    // =====================================================
    // SECTION VERIFIKASI PENGGUNA
    // =====================================================
    // =====================================================
    // STATE KOSONG (ADMIN-EMPTY)
    // =====================================================
    // =====================================================
    // NAVIGASI
    // =====================================================
    // =====================================================
    // KONTROL AKSES
    // =====================================================
});
