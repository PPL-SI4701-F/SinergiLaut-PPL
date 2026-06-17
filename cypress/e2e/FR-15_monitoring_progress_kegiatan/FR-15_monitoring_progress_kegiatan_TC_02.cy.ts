describe('FR-15: Monitoring progress kegiatan - TC-02', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        // Precondition: pengguna sudah masuk ke dalam dashboard pengguna
        cy.login('approved1@user.com', 'Password@2026');
        
        // Membersihkan data pendaftaran relawan dari pengujian sebelumnya agar tidak bentrok
        cy.task('deleteVolunteer', { 
            email: 'approved1@user.com', 
            activityTitle: 'Edukasi Pesisir untuk Anak Lombok' 
        });
    });

    it('Akses kegiatan aktif dan mendaftarkan relawan', () => {
        // Step 1: klik satu kegiatan
        cy.task('getActivityIdByTitle', 'Edukasi Pesisir untuk Anak Lombok').then((id) => {
            cy.visit(`/activities/${id}`);
        });

        // Step 2, 3, 4: lihat progress kegiatan, dana, dan relawan
        cy.get('[role="progressbar"]').should('exist');
        cy.contains(/0\s*dari\s*15|0 relawan/i).should('exist');

        // Step 5: klik tombol daftar relawan
        cy.contains('button', /Daftar Relawan/i).click();

        // Step 6: Mengisi Nama lengkap
        cy.get('input[placeholder*="Nama lengkap"]').clear().type('Muhamad Habibi Budiman');
        
        // Step 7: Mengisi Umur
        cy.get('input[type="number"]').clear().type('21');
        
        // Step 8: Mengisi nomer telepon
        cy.get('input[type="tel"]').clear().type('102022300226');
        
        // Menyetujui syarat & ketentuan
        cy.get('input[type="checkbox"]#agreed').check();

        // Submit form
        cy.contains('button', /Daftar Sebagai Relawan/i).click();

        // Alert sukses
        cy.contains(/Pendaftaran berhasil|Berhasil mendaftar/i, { timeout: 10000 }).should('be.visible');
    });
});