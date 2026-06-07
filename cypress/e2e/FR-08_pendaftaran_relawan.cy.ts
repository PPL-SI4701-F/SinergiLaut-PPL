describe('FR-08: Pendaftaran relawan', () => {
  const activityId = 'mock-activity-123';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'user');

    cy.intercept('GET', '**/auth/v1/user*', {
      statusCode: 200,
      body: {
        id: 'test-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'test@example.com',
        user_metadata: { role: 'user' }
      }
    });

    // Mock Activity Details
    cy.intercept('GET', '**/rest/v1/activities?*', {
      statusCode: 200,
      body: {
        id: activityId,
        title: 'Bersih Pantai',
        status: 'published',
        volunteer_quota: 50,
        volunteer_count: 10,
        category: 'Konservasi',
        start_date: new Date().toISOString(),
        community: { id: 'community-1', name: 'Eco Ocean', logo_url: null, is_verified: true },
        reports: [],
        feedbacks: [],
        volunteer_registrations: []
      }
    }).as('getActivity');
  });

  // ── Happy Path ─────────────────────────────────
  it('Harus mengizinkan pengguna mendaftar sebagai relawan', () => {
    cy.intercept('POST', '**/rest/v1/volunteer_registrations*', {
      statusCode: 201,
      body: [{ id: 'reg-happy', status: 'pending' }]
    }).as('submitRegistration');

    cy.visit(`/activities/${activityId}`);
    cy.wait('@getActivity');

    // Click on the "Daftar Relawan" tab button
    cy.contains('button', 'Daftar Relawan').click();

    // Fill form
    cy.get('input[placeholder="Nama lengkap"]').clear().type('Mock User');
    cy.get('input[placeholder="Umur (tahun)"]').type('20');
    cy.get('input[placeholder="+62 8xx xxxx xxxx"]').type('081234567890');

    // Accept terms
    cy.get('#agreed').check({ force: true });

    // Submit registration
    cy.contains('button', 'Daftar Sebagai Relawan').click();

    // Check success state
    cy.contains(/Pendaftaran berhasil|Terdaftar \(pending\)/i).should('be.visible');
  });

  // ── Edge Case 1: Umur di bawah batas minimum (< 12) ──
  it('Harus menolak umur di bawah batas minimum (contoh: 5 tahun)', () => {
    cy.visit(`/activities/${activityId}`);
    cy.wait('@getActivity');
    cy.wait(500);

    cy.contains('button', 'Daftar Relawan').click({ force: true });

    cy.get('input[placeholder="Nama lengkap"]').clear().type('Anak Kecil');
    cy.get('input[placeholder="Umur (tahun)"]').clear().type('5');
    cy.get('input[placeholder="+62 8xx xxxx xxxx"]').type('081234567890');
    cy.get('#agreed').check({ force: true });

    cy.contains('button', 'Daftar Sebagai Relawan').click({ force: true });

    // Either HTML5 rejects it OR UI shows an error message
    cy.get('input[placeholder="Umur (tahun)"]').then(($input) => {
      const el = $input[0] as HTMLInputElement;
      const isInvalid = el.validity.rangeUnderflow ||
        el.validity.customError ||
        !el.validity.valid;
      if (!isInvalid) {
        cy.contains(/umur|usia|minimal|minimum|tidak valid/i).should('be.visible');
      } else {
        expect(isInvalid).to.be.true;
      }
    });
  });

  // ── Edge Case 2: Umur di atas batas logis (> 100) ──
  it('Harus menolak umur yang tidak masuk akal (contoh: 999)', () => {
    cy.visit(`/activities/${activityId}`);
    cy.wait('@getActivity');
    cy.wait(500);

    cy.contains('button', 'Daftar Relawan').click({ force: true });

    cy.get('input[placeholder="Nama lengkap"]').clear().type('Kakek Tua');
    cy.get('input[placeholder="Umur (tahun)"]').clear().type('999');
    cy.get('input[placeholder="+62 8xx xxxx xxxx"]').type('081234567890');
    cy.get('#agreed').check({ force: true });

    cy.contains('button', 'Daftar Sebagai Relawan').click({ force: true });

    cy.get('input[placeholder="Umur (tahun)"]').then(($input) => {
      const el = $input[0] as HTMLInputElement;
      const isInvalid = el.validity.rangeOverflow ||
        el.validity.customError ||
        !el.validity.valid;
      if (!isInvalid) {
        cy.contains(/umur|usia|tidak valid|maksimal/i).should('be.visible');
      } else {
        expect(isInvalid).to.be.true;
      }
    });
  });

  // ── Edge Case 3: Format nomor telepon berisi huruf ──
  it('Harus menolak nomor telepon yang mengandung huruf', () => {
    cy.visit(`/activities/${activityId}`);
    cy.wait('@getActivity');
    cy.wait(500);

    cy.contains('button', 'Daftar Relawan').click({ force: true });

    cy.get('input[placeholder="Nama lengkap"]').clear().type('John Doe');
    cy.get('input[placeholder="Umur (tahun)"]').clear().type('25');
    cy.get('input[placeholder="+62 8xx xxxx xxxx"]').clear().type('abcdef1234');
    cy.get('#agreed').check({ force: true });

    cy.contains('button', 'Daftar Sebagai Relawan').click({ force: true });

    cy.get('input[placeholder="+62 8xx xxxx xxxx"]').then(($input) => {
      const isInvalid = !(($input[0] as HTMLInputElement).validity.valid);
      if (!isInvalid) {
        cy.contains(/nomor|telepon|hp|tidak valid|format/i).should('be.visible');
      } else {
        expect(isInvalid).to.be.true;
      }
    });
  });

  // ── Edge Case 4: Nomor telepon terlalu pendek ──
  it('Harus menolak nomor telepon yang terlalu pendek (kurang dari 10 digit)', () => {
    cy.visit(`/activities/${activityId}`);
    cy.wait('@getActivity');
    cy.wait(500);

    cy.contains('button', 'Daftar Relawan').click({ force: true });

    cy.get('input[placeholder="Nama lengkap"]').clear().type('Budi');
    cy.get('input[placeholder="Umur (tahun)"]').clear().type('22');
    cy.get('input[placeholder="+62 8xx xxxx xxxx"]').clear().type('08123'); // too short
    cy.get('#agreed').check({ force: true });

    cy.contains('button', 'Daftar Sebagai Relawan').click({ force: true });

    cy.get('input[placeholder="+62 8xx xxxx xxxx"]').then(($input) => {
      const isInvalid = !(($input[0] as HTMLInputElement).validity.valid);
      if (!isInvalid) {
        cy.contains(/nomor|telepon|hp|kurang|pendek|minimal/i).should('be.visible');
      } else {
        expect(isInvalid).to.be.true;
      }
    });
  });

  // ── Edge Case 5: Nama sangat panjang / karakter khusus ──
  it('Harus menangani nama yang sangat panjang tanpa membuat aplikasi crash', () => {
    cy.intercept('POST', '**/rest/v1/volunteer_registrations*', {
      statusCode: 201,
      body: [{ id: 'reg-extreme', status: 'pending' }]
    }).as('submitRegistration');

    cy.visit(`/activities/${activityId}`);
    cy.wait('@getActivity');
    cy.wait(500);

    cy.contains('button', 'Daftar Relawan').click({ force: true });

    // Very long name (100 chars)
    const longName = 'A'.repeat(100);
    cy.get('input[placeholder="Nama lengkap"]').clear().type(longName, { delay: 0 });
    cy.get('input[placeholder="Umur (tahun)"]').clear().type('25');
    cy.get('input[placeholder="+62 8xx xxxx xxxx"]').type('081234567890');
    cy.get('#agreed').check({ force: true });

    cy.contains('button', 'Daftar Sebagai Relawan').click({ force: true });

    // App must not show a Next.js unhandled error page
    cy.get('body').should('be.visible');
    // Either validation or success - page should still be functional
    cy.get('html').should('not.have.attr', 'data-nextjs-error');
  });

  // ── Edge Case 6: Submit tanpa centang syarat & ketentuan ──
  it('Harus menonaktifkan tombol submit saat kotak centang syarat belum dicentang', () => {
    cy.visit(`/activities/${activityId}`);
    cy.wait('@getActivity');
    cy.wait(500);

    cy.contains('button', 'Daftar Relawan').click({ force: true });

    cy.get('input[placeholder="Nama lengkap"]').clear().type('Siti Aminah');
    cy.get('input[placeholder="Umur (tahun)"]').clear().type('23');
    cy.get('input[placeholder="+62 8xx xxxx xxxx"]').type('081234567890');
    // Intentionally NOT checking #agreed

    // The submit button should be DISABLED when checkbox is unchecked
    // (or clicking should show a validation error)
    cy.contains('button', 'Daftar Sebagai Relawan').then(($btn) => {
      if ($btn.prop('disabled')) {
        // UI correctly disables button - this is the expected behavior
        expect($btn.prop('disabled')).to.be.true;
      } else {
        // If not disabled, clicking should show error
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
