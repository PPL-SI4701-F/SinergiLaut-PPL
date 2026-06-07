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
    cy.intercept('POST', '**/rest/v1/reports*', {
      statusCode: 201,
      body: [{ id: 'report-1', status: 'submitted' }]
    }).as('submitReport');

    // Asumsi rute pelaporan
    cy.visit('/community/dashboard/reports');
    
    // Tunggu hidrasi Next.js selesai sepenuhnya
    cy.wait(1000);
    
    cy.contains('button', /Buat Laporan|Create Report/i).click({ force: true });

    cy.get('input[name="title"]').type('Laporan Kegiatan Bersih Pantai');
    cy.get('textarea[name="summary"]').type('Semua berjalan lancar.');

    // Upload struk atau tambah item (optional depending on exact UI)
    // cy.get('input[type="file"]').selectFile('cypress/fixtures/struk.png');

    cy.contains('button', /Kirim|Submit/i).click();

    cy.wait('@submitReport');
    cy.contains(/Berhasil|Sukses/i).should('be.visible');
  });

  // ─────────────────────────────────────────────
  // Edge Case 1: Submit laporan kosong (empty form)
  // ─────────────────────────────────────────────
  it('Harus memblokir pengiriman saat judul atau ringkasan laporan kosong', () => {
    cy.visit('/community/dashboard/reports');
    cy.wait(1000);

    cy.contains('button', /Buat Laporan/i).click({ force: true });

    // Leave title and summary empty, try to submit
    cy.contains('button', /Kirim|Submit/i).click();

    cy.get('input[name="title"]').then(($input) => {
      const isInvalid = !(($input[0] as HTMLInputElement).validity.valid);
      if (!isInvalid) {
        cy.contains(/judul|ringkasan|wajib|harus diisi|field/i).should('be.visible');
      } else {
        expect(isInvalid).to.be.true;
      }
    });
  });

  // ─────────────────────────────────────────────
  // Edge Case 2: Submit laporan dengan hanya spasi
  // ─────────────────────────────────────────────
  it('Harus memblokir pengiriman saat judul hanya berisi spasi', () => {
    cy.intercept('POST', '**/rest/v1/reports*', {
      statusCode: 201,
      body: [{ id: 'report-ws', status: 'submitted' }]
    }).as('submitReportWS');

    cy.visit('/community/dashboard/reports');
    cy.wait(1000);

    cy.contains('button', /Buat Laporan/i).click({ force: true });

    // Fill with whitespace only
    cy.get('input[name="title"]').type('   ');
    cy.get('textarea[name="summary"]').type('   ');
    cy.contains('button', /Kirim|Submit/i).click();

    // The POST to reports should NOT have been called
    cy.get('@submitReportWS.all').then((calls) => {
      expect(calls).to.have.length(0);
    });

    // Error message about required fields
    cy.contains(/field|wajib|harus|diisi|tidak boleh kosong/i).should('be.visible');
  });
});
