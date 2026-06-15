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
    it('Setelah disetujui, kegiatan harus hilang dari daftar pending', () => {
        cy.visit('/admin/dashboard');
        cy.wait(1000);

        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD').should('be.visible');
        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD').closest('.rounded-lg').within(() => {
            cy.get('button.bg-green-600').click();
        });

        cy.contains('Edukasi Lingkungan Laut untuk Pelajar SD').should('not.exist');
    });
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
