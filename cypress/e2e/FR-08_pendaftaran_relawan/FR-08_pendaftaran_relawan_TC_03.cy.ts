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
    it('Harus menolak umur yang tidak masuk akal (contoh: 999)', () => {
        cy.wait(500);

        cy.contains('button', 'Daftar Relawan').click({ force: true });

        cy.get('input[placeholder="Nama lengkap"]').clear().type('Kakek Tua');
        cy.get('input[placeholder="Umur (tahun)"]').clear().type('999');
        cy.get('input[placeholder="+62 8xx xxxx xxxx"]').type('081234567890');
        cy.get('#agreed').check({ force: true });

        cy.contains('button', 'Daftar Sebagai Relawan').click({ force: true });

        cy.get('input[placeholder="Umur (tahun)"]').then(($input) => {
            const el = $input[0] as HTMLInputElement;
            const isInvalid = el.validity.rangeOverflow ||
                el.validity.customError ||
                !el.validity.valid;
            if (!isInvalid) {
                cy.contains(/umur|usia|tidak valid|maksimal/i).should('be.visible');
            } else {
                expect(isInvalid).to.be.true;
            }
        });
    });
});
