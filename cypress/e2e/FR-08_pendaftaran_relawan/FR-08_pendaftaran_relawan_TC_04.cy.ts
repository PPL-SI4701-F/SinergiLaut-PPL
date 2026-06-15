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
    it('Harus menolak nomor telepon yang mengandung huruf', () => {
        cy.wait(500);

        cy.contains('button', 'Daftar Relawan').click({ force: true });

        cy.get('input[placeholder="Nama lengkap"]').clear().type('John Doe');
        cy.get('input[placeholder="Umur (tahun)"]').clear().type('25');
        cy.get('input[placeholder="+62 8xx xxxx xxxx"]').clear().type('abcdef1234');
        cy.get('#agreed').check({ force: true });

        cy.contains('button', 'Daftar Sebagai Relawan').click({ force: true });

        cy.get('input[placeholder="+62 8xx xxxx xxxx"]').then(($input) => {
            const isInvalid = !(($input[0] as HTMLInputElement).validity.valid);
            if (!isInvalid) {
                cy.contains(/nomor|telepon|hp|tidak valid|format/i).should('be.visible');
            } else {
                expect(isInvalid).to.be.true;
            }
        });
    });
});
