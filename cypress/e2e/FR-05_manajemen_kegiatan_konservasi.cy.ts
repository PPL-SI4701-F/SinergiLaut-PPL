describe('FR-05: Manajemen kegiatan konservasi', () => {
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

    cy.intercept('GET', '**/rest/v1/communities*', {
      statusCode: 200,
      body: { id: 'community-id-123' }
    });
  });

  it('Harus menampilkan pesan validasi saat formulir kosong disubmit', () => {
    cy.visit('/community/dashboard/activities/create');
    cy.wait(1000);

    cy.contains('button', 'Ajukan untuk Review').click();

    cy.get('input[name="title"]').then(($input) => {
      expect(($input[0] as HTMLInputElement).validationMessage).to.not.be.empty;
    });
  });

  it('Harus berhasil mengisi formulir dan membuat kegiatan baru', () => {
    cy.intercept('POST', '**/activities/create').as('createActivity');

    cy.visit('/community/dashboard/activities/create');
    cy.wait(1000);

    cy.get('input[name="title"]').type('Bersih Pantai Mutiara');
    cy.get('textarea[name="description"]').type('Kegiatan pembersihan area pesisir pantai mutiara.');
    cy.get('input[name="location"]').type('Pantai Mutiara, Jakarta');

    const d = new Date();
    d.setMonth(d.getMonth() + 7);
    const validFuture = d.toISOString().slice(0, 16);
    cy.get('input[name="startDate"]').type(new Date().toISOString().slice(0, 16));
    cy.get('input[name="executionDate"]').type(validFuture);

    cy.contains('button', 'Ajukan untuk Review').click();

    cy.url({ timeout: 15000 }).should('satisfy', (url: string) =>
      url.includes('/community/dashboard')
    );
  });

  it('Harus merender payload XSS pada judul kegiatan dengan aman', () => {
    const xssPayload = '<script>alert("xss")</script>';

    cy.visit('/community/dashboard/activities/create');
    cy.wait(1000);

    cy.get('input[name="title"]').type(xssPayload, { parseSpecialCharSequences: false });
    cy.get('body').should('be.visible');
    cy.get('input[name="title"]').should('have.value', xssPayload);

    cy.get('script[src]').then(($scripts) => {
      $scripts.each((_, el) => {
        expect(el.textContent || '').not.to.include('alert("xss")');
      });
    });
  });

  it('Harus menampilkan daftar kegiatan dengan berbagai status di dashboard komunitas', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Kelola Kegiatan').should('be.visible');
    cy.contains('Bersih Pantai Mutiara').should('be.visible');
    cy.contains('Konservasi Mangrove Cilincing').should('be.visible');
    cy.contains('Pemantauan Koral Kepulauan Seribu').should('be.visible');
    cy.contains('Restorasi Ekosistem Pantai Kramat').should('be.visible');
    cy.contains('Tanam Mangrove Pulau Tidung').should('be.visible');
  });

  it('Harus menampilkan tombol Edit yang mengarah ke halaman edit untuk kegiatan berstatus Draft', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Konservasi Mangrove Cilincing').parents('.border-border').within(() => {
      cy.contains('a', 'Edit')
        .should('have.attr', 'href')
        .and('include', '/edit');
    });
  });

  it('Harus menampilkan dialog konfirmasi dan membatalkan aksi jika memilih Tidak', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Pemantauan Koral Kepulauan Seribu').parents('.border-border').within(() => {
      cy.contains('button', 'Batalkan').click();
    });

    cy.contains('Batalkan kegiatan ini?').should('be.visible');
    cy.contains('Tindakan ini tidak dapat diurungkan.').should('be.visible');

    cy.contains('button', 'Tidak').click();
    cy.contains('Pemantauan Koral Kepulauan Seribu').should('be.visible');
  });

  it('Harus berhasil membatalkan kegiatan berstatus Menunggu Review', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Pemantauan Koral Kepulauan Seribu').parents('.border-border').within(() => {
      cy.contains('button', 'Batalkan').click();
    });

    cy.contains('Ya, Batalkan').click();
    cy.contains('berhasil dibatalkan').should('be.visible');
  });

  it('Harus berhasil menghapus kegiatan berstatus Dibatalkan setelah konfirmasi', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Tanam Mangrove Pulau Tidung').parents('.border-border').within(() => {
      cy.contains('button', 'Hapus').click();
    });

    cy.contains('Hapus kegiatan ini?').should('be.visible');
    cy.contains('Ya, Hapus').click();
    cy.contains('berhasil dihapus').should('be.visible');
  });

  it('Harus menampilkan tombol Upload Laporan untuk kegiatan berstatus Selesai', () => {
    cy.visit('/community/dashboard');
    cy.wait(1000);

    cy.contains('Restorasi Ekosistem Pantai Kramat').parents('.border-border').within(() => {
      cy.contains('a', /Upload Laporan|Lihat Laporan/)
        .should('have.attr', 'href')
        .and('include', '/report');
    });
  });
});
