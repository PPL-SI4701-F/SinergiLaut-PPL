describe('FR-08: Pendaftaran relawan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role user.
        // Data diambil langsung dari database. Kita navigasi ke detail kegiatan secara E2E untuk menghindari hardcode UUID.
        cy.login('approved2@user.com', 'Password@2026');
        cy.visit('/activities');
        cy.contains('Bersih Pantai Kuta').click({ force: true });
        // Pastikan sudah masuk ke halaman detail
        cy.contains('button', 'Daftar Relawan').should('be.visible');
    });

    it('Harus mengizinkan pengguna mendaftar sebagai relawan', () => {
        cy.contains('button', 'Daftar Relawan').click({ force: true });

        cy.get('input[placeholder="Nama lengkap"]').clear().type('Mock User');
        cy.get('input[placeholder="Umur (tahun)"]').type('20');
        cy.get('input[placeholder="+62 8xx xxxx xxxx"]').type('081234567890');
        cy.get('#agreed').check({ force: true });

        cy.contains('button', 'Daftar Sebagai Relawan').click();

        cy.contains(/Pendaftaran berhasil|Terdaftar \(pending\)/i).should('be.visible');
    });
});
