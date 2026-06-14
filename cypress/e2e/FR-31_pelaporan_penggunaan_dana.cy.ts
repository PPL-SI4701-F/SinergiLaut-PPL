describe('FR-31: Pelaporan Penggunaan Dana dan Dokumentasi', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'community');

    cy.intercept('GET', '**/auth/v1/user*', {
      statusCode: 200,
      body: {
        id: 'community-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'community@example.com',
        user_metadata: { role: 'community' }
      }
    });
  });

  it('Harus mengizinkan komunitas mengirimkan laporan', () => {
    // Asumsi rute pelaporan
    cy.visit('/community/dashboard/activities/act-1/report');
    
    // Tunggu hidrasi Next.js selesai sepenuhnya
    cy.wait(1000);
    


    cy.get('input[id="title"]').type('Laporan Kegiatan Bersih Pantai');
    cy.get('textarea[id="summary"]').type('Semua berjalan lancar.');

    // Upload struk atau tambah item (optional depending on exact UI)
    // cy.get('input[type="file"]').selectFile('cypress/fixtures/struk.png');

    cy.contains('button', /Kirim|Submit|Ajukan/i).click();

    cy.wait(500); // Wait for optimistic update
    cy.contains(/Berhasil|Sukses|diajukan/i).should('be.visible');
  });

  // ─────────────────────────────────────────────
  // Edge Case 1: Submit laporan kosong (empty form)
  // ─────────────────────────────────────────────
  it('Harus memblokir pengiriman saat judul atau ringkasan laporan kosong', () => {
    cy.setCookie('e2e-bypass-auth', 'community-empty'); // Use community-empty to start with no report
    cy.visit('/community/dashboard/activities/act-1/report');
    cy.wait(1000);



    // Leave title and summary empty, try to submit (Simpan Draft)
    cy.contains('button', /Simpan Draft/i).click();

    cy.contains(/wajib diisi/i).should('be.visible');
  });

  // ─────────────────────────────────────────────
  // Edge Case 2: Submit laporan dengan hanya spasi
  // ─────────────────────────────────────────────
  it('Harus memblokir pengiriman saat judul hanya berisi spasi', () => {
    cy.setCookie('e2e-bypass-auth', 'community-empty'); // Start empty
    cy.visit('/community/dashboard/activities/act-1/report');
    cy.wait(1000);

    // Fill with whitespace only
    cy.get('input[id="title"]').type('   ');
    cy.get('textarea[id="summary"]').type('   ');
    cy.contains('button', /Simpan Draft/i).click();

    // Error message about required fields
    cy.contains(/wajib diisi/i).should('be.visible');
  });

  // ─────────────────────────────────────────────
  // TC Tambahan: Simpan Draft
  // ─────────────────────────────────────────────
  it('Harus bisa menyimpan laporan sebagai draft tanpa men-submit ke admin', () => {
    cy.setCookie('e2e-bypass-auth', 'community-empty');
    cy.visit('/community/dashboard/activities/act-1/report');
    cy.wait(1000);
    cy.get('input[id="title"]').type('Draft Laporan');
    cy.get('textarea[id="summary"]').type('Ini baru draft');
    cy.contains('button', /Simpan Draft/i).click();
    
    // Asumsi UI menampilkan toast atau mengubah badge status menjadi draft
    cy.contains(/Draft disimpan|Berhasil/i).should('be.visible');
  });

  // ─────────────────────────────────────────────
  // TC Tambahan: Upload Bukti Dokumentasi dan Submit
  // ─────────────────────────────────────────────
  it('Harus bisa mengunggah file bukti dokumentasi dan laporan berubah status jadi submitted', () => {
    cy.setCookie('e2e-bypass-auth', 'community-empty');
    cy.visit('/community/dashboard/activities/act-1/report');
    cy.wait(1000);
    cy.get('input[id="title"]').type('Laporan Lengkap');
    cy.get('textarea[id="summary"]').type('Dengan bukti nota.');
    
    // Simulasi upload file (menggunakan stub/mock file yang valid)
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('file contents'),
      fileName: 'bukti.jpg',
      mimeType: 'image/jpeg'
    }, { force: true });
    
    cy.contains('button', /Kirim|Submit|Ajukan/i).click();
    cy.wait(500);
    cy.contains(/Berhasil/i).should('be.visible');
    
    // Verifikasi bahwa status laporan adalah 'submitted'
    cy.contains(/Submitted|Diajukan/i).should('be.visible');
  });
});
