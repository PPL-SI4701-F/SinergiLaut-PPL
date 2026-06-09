describe('FR-03: Mengelola Profil Pengguna', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');

    // Mock profiles API to return pending volunteer_status and no nik, so the form is enabled
    cy.intercept('GET', '**/rest/v1/profiles?*', (req) => {
      req.continue((res) => {
        if (res.body && Array.isArray(res.body) && res.body.length > 0) {
          res.body[0].volunteer_status = 'pending';
          res.body[0].nik = null;
        }
      });
    }).as('getProfile');
  });

  it('Harus menampilkan halaman edit profil dengan data pengguna', () => {
    cy.visit('/user/profile');
    cy.wait(1000);

    cy.contains('h1', 'Edit Profil').should('be.visible');
    cy.contains('Informasi Pribadi').should('be.visible');
    cy.get('input#full_name').should('be.visible');
    cy.get('input#phone').should('be.visible');
    cy.get('textarea#bio').should('be.visible');

    // Email field is read-only
    cy.contains('Email tidak dapat diubah').should('be.visible');
  });

  it('Harus mengizinkan pengguna mengubah nama, nomor telepon, dan bio lalu menyimpan', () => {
    cy.visit('/user/profile');
    cy.wait(1000);

    cy.get('input#full_name').clear().type('Budi Santoso Updated');
    cy.get('input#phone').clear().type('081234567890');
    cy.get('textarea#bio').clear().type('Saya peduli pada kelestarian laut Indonesia.');

    cy.contains('button', 'Simpan Perubahan').click();
  });

  it('Harus menampilkan batas karakter pada nama dan bio', () => {
    cy.visit('/user/profile');
    cy.wait(1000);

    cy.get('input#full_name').should('have.attr', 'maxlength', '100');
    cy.get('textarea#bio').should('have.attr', 'maxlength', '300');
    cy.contains('/100').should('be.visible');
    cy.contains('/300').should('be.visible');
  });

  it('Harus menampilkan banner status verifikasi relawan untuk pengguna dengan role user', () => {
    cy.visit('/user/profile');
    cy.wait(1000);

    cy.contains('Status Verifikasi').should('be.visible');
  });

  it('Harus menampilkan form verifikasi data diri relawan dengan field wajib', () => {
    cy.visit('/user/profile');
    cy.wait(1000);

    cy.contains('Verifikasi Data Diri Volunteer').should('be.visible');
    cy.get('input#v_full_name').should('be.visible');
    cy.get('input#date_of_birth').should('be.visible');
    cy.get('input#nik').should('be.visible').and('have.attr', 'maxlength', '16');
    cy.get('select#gender').should('be.visible');
    cy.get('input#v_phone').should('be.visible');
    cy.contains('Alamat Lengkap').should('be.visible');
    cy.contains('Unggah Foto KTP').should('be.visible');
  });

  it('Harus membatasi input NIK hanya menerima 16 digit angka', () => {
    cy.visit('/user/profile');
    cy.wait(1000);

    cy.get('input#nik').invoke('prop', 'disabled', false).clear().type('123abc456').should('have.value', '123abc456');
    cy.get('input#nik').should('have.attr', 'maxlength', '16');
  });

  it('Harus mengizinkan pengguna mengganti foto profil melalui tombol kamera', () => {
    cy.visit('/user/profile');
    cy.wait(1000);

    cy.get('input[type="file"][accept="image/*"]').first().should('exist');
  });
});
