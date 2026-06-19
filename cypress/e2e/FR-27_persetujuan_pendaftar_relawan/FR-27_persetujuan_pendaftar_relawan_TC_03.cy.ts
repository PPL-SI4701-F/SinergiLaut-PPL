describe('FR-27: Persetujuan Pendaftar Relawan - TC-03', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();

        // Precondition: Terdapat relawan pending pada kegiatan Edukasi Pesisir untuk Anak Lombok
        // Relawan Andi Pratama (pending1@user.com) mendaftar ke kegiatan tersebut
        cy.task('registerVolunteer', { 
            email: 'pending1@user.com', 
            activityTitle: 'Edukasi Pesisir untuk Anak Lombok' 
        });
    });

    // afterEach(() => {
    //     // Cleanup relawan setelah test selesai agar tidak bentrok dengan test lain
    //     cy.task('deleteVolunteer', { 
    //         email: 'pending1@user.com', 
    //         activityTitle: 'Edukasi Pesisir untuk Anak Lombok' 
    //     });
    // });

    it('Menolak pengguna menjadi relawan di suatu kegiatan', () => {
        // Step 1: Akses menu login
        cy.visit('/login');

        // Step 2: Mengisi email
        cy.get('input#email').clear().type('owner2@example.com');

        // Step 3: Mengisi password
        cy.get('input#password').clear().type('Password@2026');

        // Step 4: Klik tombol "Masuk ke Akun"
        cy.contains('button', /Masuk ke Akun/i).click();

        // Step 5: Pengguna bisa masuk ke halaman dashboard komunitas
        cy.url().should('include', '/community/dashboard');
        cy.contains('Edukasi Pesisir untuk Anak Lombok').should('exist');

        // Step 6: Pencet tombol kelola pada kegiatan Edukasi pesisir untuk anak Lombok
        // Cari kegiatan berdasarkan judul, dan klik Kelola
        cy.contains('div.rounded-xl', 'Edukasi Pesisir untuk Anak Lombok')
          .find('a')
          .contains(/Kelola/i)
          .click();
        
        cy.url().should('include', '/volunteers');

        // Step 7: Pencet tombol "tolak" pada relawan Andi Pratama
        // Cari card yang berisi Andi Pratama
        cy.contains('.rounded-xl', 'Andi Pratama').within(() => {
            // klik tombol Tolak
            cy.contains('button', /Tolak/i).click();
        });

        // Verifikasi hasil (Relawan yang diterima berubah status menjadi ditolak)
        cy.contains('.rounded-xl', 'Andi Pratama').within(() => {
            cy.contains('span', /Ditolak/i).should('exist');
        });
    });
});
