describe('FR-12: Verifikasi Pengguna (/admin/users)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('FR 12 - Harus dapat menolak verifikasi pengguna - TC 05', () => {
        const unique = Date.now();
        const email = `fr12tc05_${unique}@test.com`;
        const fullName = `FR 12 TC 05 ${unique}`;
        const phone = '081234567890';

        // PRE-CONDITION 1: Buat user volunteer baru
        cy.task('createVolunteerUser', { email, password: 'Password@2026', fullName, phone });
        
        // Clear admin session dari beforeEach
        cy.clearCookies();
        cy.clearLocalStorage();

        // PRE-CONDITION 2: Login sebagai user baru dan isi form verifikasi volunteer
        cy.login(email, 'Password@2026');
        cy.visit('/user/profile');
        cy.wait(1000);

        cy.get('input[id="v_full_name"]').clear().type(fullName);
        cy.get('input[id="date_of_birth"]').type('1990-01-01');
        cy.get('input[id="nik"]').clear().type('1234567890123456');
        cy.get('select[id="gender"]').select('male');
        cy.get('input[id="v_phone"]').clear().type(phone);
        cy.get('textarea[id="address"]').clear().type('Jl. Merdeka No. 123');

        // Mock upload KTP (ambil elemen input file terakhir, karena yang pertama biasanya avatar)
        cy.get('input[type="file"]').last().selectFile({
            contents: Cypress.Buffer.from('file contents'),
            fileName: 'ktp.jpg',
            mimeType: 'image/jpeg'
        }, { force: true });

        cy.wait(500);
        cy.contains('button', 'Ajukan Verifikasi').click();
        cy.wait(1000);

        // TEST CASE UTAMA: Tolak verifikasi pengguna
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
        cy.visit('/admin/users');
        cy.contains('button', 'Menunggu').first().click();
        
        // Cari user yang baru dibuat
        cy.contains(fullName).parents('.border-yellow-300').find('button').first().click({ force: true });
        
        cy.contains('Tolak').click();

        // Dialog penolakan muncul, cari textarea alasan
        cy.get('textarea').type('Data tidak valid');
        cy.contains('button', 'Konfirmasi').click();
    });
});
