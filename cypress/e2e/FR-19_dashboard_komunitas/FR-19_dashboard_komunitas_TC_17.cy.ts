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
    it('Harus menutup dialog Ajukan Edit saat tombol Batal diklik', () => {
        cy.visit('/community/dashboard');
        cy.wait(1000);

        cy.contains('Bersih Pantai Kuta').parents('.border-border').within(() => {
            cy.contains('button', /Ajukan Edit/i).click();
        });

        cy.contains('Ajukan Edit Kegiatan').should('be.visible');
        // Scope ke dalam dialog untuk menghindari pencocokan dengan tombol "Batalkan" di latar
        cy.get('[role="dialog"]').contains('button', 'Batal').click();
        cy.contains('Ajukan Edit Kegiatan').should('not.exist');
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
