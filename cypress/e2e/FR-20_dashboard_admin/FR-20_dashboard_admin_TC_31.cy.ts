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

    it('Harus menampilkan state kosong "Tidak ada yang pending." saat tidak ada komunitas pending', () => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.setCookie('e2e-bypass-auth', 'admin-empty');
        cy.visit('/admin/dashboard');
        cy.wait(1000);

        cy.contains('Komunitas Pending').should('be.visible');
        cy.contains('Tidak ada yang pending.').should('be.visible');
    });
    // =====================================================
    // NAVIGASI
    // =====================================================
    // =====================================================
    // KONTROL AKSES
    // =====================================================
});
