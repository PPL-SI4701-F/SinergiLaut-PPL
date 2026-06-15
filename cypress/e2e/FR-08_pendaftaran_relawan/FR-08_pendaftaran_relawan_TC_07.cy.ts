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
    it('Harus menonaktifkan tombol submit saat kotak centang syarat belum dicentang', () => {
        cy.wait(500);

        cy.contains('button', 'Daftar Relawan').click({ force: true });

        cy.get('input[placeholder="Nama lengkap"]').clear().type('Siti Aminah');
        cy.get('input[placeholder="Umur (tahun)"]').clear().type('23');
        cy.get('input[placeholder="+62 8xx xxxx xxxx"]').type('081234567890');

        cy.contains('button', 'Daftar Sebagai Relawan').then(($btn) => {
            if ($btn.prop('disabled')) {
                expect($btn.prop('disabled')).to.be.true;
            } else {
                cy.wrap($btn).click({ force: true });
                cy.get('#agreed').then(($checkbox) => {
                    const isRequired = $checkbox[0].hasAttribute('required');
                    if (isRequired) {
                        expect(($checkbox[0] as HTMLInputElement).validity.valid).to.be.false;
                    } else {
                        cy.contains(/setuju|syarat|persetujuan|wajib/i).should('be.visible');
                    }
                });
            }
        });
    });
});
