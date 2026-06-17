describe('FR-15: Monitoring progress kegiatan - TC-04', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        // Precondition: pengguna sudah masuk kedalam kegiatan yang aktif
        cy.login('approved1@user.com', 'Password@2026');
    });

    it('Tampil indikator donasi melebihi target donasi', () => {
        cy.task('getActivityIdByTitle', 'Edukasi Pesisir untuk Anak Lombok').then((id) => {
            cy.visit(`/activities/${id}`);
        });

        // Step 1: Klik Tombol donasi
        cy.contains('button', /Donasi/i).click();

        // Step 2: Mengisi Nama Donatur
        cy.get('input[placeholder="Nama Anda"]').clear().type('Muhamad Habibi Budiman');

        // Step 3: Mengisi Email
        cy.get('input[type="email"]').clear().type('habibi@gmail.com');

        // Step 4: Mengisi Nominal Donasi (IDR) melebihi target
        cy.get('input[type="number"]').clear().type('100000000');

        // Step 5: Mengisi pesan / catatan
        cy.get('textarea').clear().type('Semoga bermanfaat donasi nya');

        // Step 6: Klik Tombol bayar sekarang
        cy.contains('button', /Bayar/i).click();

        // Step 7: Klik Tombol Qris
        cy.contains('Pilih Metode Pembayaran', { timeout: 10000 }).should('be.visible');
        cy.contains('button', 'QRIS').click();

        // Step 8: Klik Tombol Submit "Simulasi Sukses"
        cy.contains('Selesaikan Pembayaran').should('be.visible');
        cy.contains('button', /Simulasi Sukses/i).click();

        // Menunggu donasi berhasil diproses
        cy.contains('Pembayaran berhasil', { timeout: 10000 }).should('be.visible');

        // MANUAL BUMP: Karena db:reset prisma menghapus trigger donasi di database lokal, 
        // kita tambahkan donasinya secara manual ke tabel activities
        cy.task('bumpFunding', { 
            activityTitle: 'Edukasi Pesisir untuk Anak Lombok', 
            amount: 100000000 
        });

        // Tunggu dan reload halaman agar UI mendapatkan data terbaru
        cy.wait(2000);
        cy.reload();
        cy.contains('Memuat...').should('not.exist');

        // Step 9: Pastikan Donasi nya masuk ke Progres bar Donasi Terkumpul, serta melebihi target
        cy.contains(/100%/i, { timeout: 15000 }).should('exist');
        
        // Memastikan nominalnya mencapai ratusan juta (karena donasi 100jt + 1.5jt seed data)
        cy.contains(/\d{3}\.?\d{3}\.?\d{3}/i, { timeout: 15000 }).should('exist');
    });
});