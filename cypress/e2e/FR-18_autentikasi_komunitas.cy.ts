describe('FR-18: Autentikasi & Pendaftaran Akun Komunitas', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('Harus menampilkan halaman pendaftaran komunitas dengan stepper 4 langkah', () => {
    cy.visit('/community/register');
    cy.wait(1000);

    cy.contains('h1', 'Bergabung dengan SinergiLaut sebagai Komunitas Konservasi').should('be.visible');
    cy.contains('Informasi Komunitas').should('be.visible');
    cy.contains('Step 1 of 4').should('exist');
  });

  it('Harus menampilkan field informasi komunitas dan kontak admin pada langkah 1', () => {
    cy.visit('/community/register');
    cy.wait(1000);

    cy.get('input[placeholder="contoh: Ocean Guardians Indonesia"]').should('be.visible');
    cy.get('textarea[placeholder*="Deskripsikan misi dan kegiatan komunitas"]').should('be.visible');
    cy.get('input[placeholder="Nama lengkap administrator"]').should('be.visible');
    cy.get('input[placeholder="admin@community.org"]').should('be.visible');
    cy.get('input[placeholder="+62 812 3456 7890"]').should('be.visible');
    cy.get('input[placeholder="Minimal 8 karakter"]').should('be.visible');
    cy.get('input[placeholder="Ulangi password"]').should('be.visible');
  });

  it('Harus menampilkan validasi saat nama komunitas kurang dari 3 karakter', () => {
    cy.visit('/community/register');
    cy.wait(1000);

    cy.get('input[placeholder="contoh: Ocean Guardians Indonesia"]').type('AB');
    cy.get('textarea[placeholder*="Deskripsikan misi dan kegiatan komunitas"]')
      .type('Komunitas peduli laut dan ekosistem pesisir Indonesia.');
    cy.get('input[placeholder="Nama lengkap administrator"]').type('Admin Test');
    cy.get('input[placeholder="admin@community.org"]').type('admin@community.org');
    cy.get('input[placeholder="+62 812 3456 7890"]').type('081234567890');
    cy.get('input[placeholder="Minimal 8 karakter"]').type('ValidPass123!');
    cy.get('input[placeholder="Ulangi password"]').type('ValidPass123!');

    cy.contains('button', 'Lanjut').click();
    cy.contains('Nama komunitas minimal 3 karakter.').should('be.visible');
  });

  it('Harus menampilkan validasi format email yang tidak valid', () => {
    cy.visit('/community/register');
    cy.wait(1000);

    cy.get('input[placeholder="contoh: Ocean Guardians Indonesia"]').type('Ocean Guardians');
    cy.get('textarea[placeholder*="Deskripsikan misi dan kegiatan komunitas"]')
      .type('Komunitas peduli laut dan ekosistem pesisir Indonesia.');
    cy.get('input[placeholder="Nama lengkap administrator"]').type('Admin Test');
    cy.get('input[placeholder="admin@community.org"]').type('emailtidakvalid');
    cy.get('input[placeholder="+62 812 3456 7890"]').type('081234567890');
    cy.get('input[placeholder="Minimal 8 karakter"]').type('ValidPass123!');
    cy.get('input[placeholder="Ulangi password"]').type('ValidPass123!');

    cy.contains('button', 'Lanjut').click();
    cy.contains('Format email tidak valid. Pastikan menggunakan @.').should('be.visible');
  });

  it('Harus menampilkan validasi password minimal 8 karakter dan kecocokan konfirmasi password', () => {
    cy.visit('/community/register');
    cy.wait(1000);

    cy.get('input[placeholder="contoh: Ocean Guardians Indonesia"]').type('Ocean Guardians');
    cy.get('textarea[placeholder*="Deskripsikan misi dan kegiatan komunitas"]')
      .type('Komunitas peduli laut dan ekosistem pesisir Indonesia.');
    cy.get('input[placeholder="Nama lengkap administrator"]').type('Admin Test');
    cy.get('input[placeholder="admin@community.org"]').type('admin@community.org');
    cy.get('input[placeholder="+62 812 3456 7890"]').type('081234567890');
    cy.get('input[placeholder="Minimal 8 karakter"]').type('short');
    cy.get('input[placeholder="Ulangi password"]').type('short');

    cy.contains('button', 'Lanjut').click();
    cy.contains('Password minimal 8 karakter.').should('be.visible');

    cy.get('input[placeholder="Minimal 8 karakter"]').clear().type('ValidPass123!');
    cy.get('input[placeholder="Ulangi password"]').clear().type('BedaPassword123!');

    cy.contains('button', 'Lanjut').click();
    cy.contains('Password dan konfirmasi password tidak cocok.').should('be.visible');
  });

  it('Harus melanjutkan ke langkah 2 (Lokasi & Kegiatan) setelah data langkah 1 valid', () => {
    cy.visit('/community/register');
    cy.wait(1000);

    cy.get('input[placeholder="contoh: Ocean Guardians Indonesia"]').type('Ocean Guardians');
    cy.get('textarea[placeholder*="Deskripsikan misi dan kegiatan komunitas"]')
      .type('Komunitas peduli laut dan ekosistem pesisir Indonesia.');
    cy.get('input[placeholder="Nama lengkap administrator"]').type('Admin Test');
    cy.get('input[placeholder="admin@community.org"]').type('admin@community.org');
    cy.get('input[placeholder="+62 812 3456 7890"]').type('081234567890');
    cy.get('input[placeholder="Minimal 8 karakter"]').type('ValidPass123!');
    cy.get('input[placeholder="Ulangi password"]').type('ValidPass123!');

    cy.contains('button', 'Lanjut').click();
    cy.contains('Step 2 of 4').should('exist');
    cy.contains('Lokasi & Kegiatan').should('be.visible');
  });
});
