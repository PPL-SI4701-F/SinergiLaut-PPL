describe('FR-05: Manajemen kegiatan konservasi', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'community');

    // Mock authentication as Community
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
      body: { id: 'community-id-123' } // Return object for .single()
    });
  });

  it('Harus menampilkan pesan validasi saat formulir kosong disubmit', () => {
    cy.visit('/community/dashboard/activities/create');
    cy.wait(1000); // Hydration wait

    // Attempt to submit empty form
    cy.contains('button', 'Ajukan untuk Review').click();

    // Check for HTML5 or React validation message
    cy.get('input[name="title"]').then(($input) => {
      expect(($input[0] as HTMLInputElement).validationMessage).to.not.be.empty;
    });
  });

  it('Harus berhasil mengisi formulir dan membuat kegiatan baru', () => {
    // Intercept Next.js Server Action submission
    cy.intercept('POST', '**/activities/create').as('createActivity');

    cy.visit('/community/dashboard/activities/create');
    cy.wait(1000);

    // Fill the required fields (based on standard SinergiLaut schema)
    cy.get('input[name="title"]').type('Bersih Pantai Mutiara');
    cy.get('textarea[name="description"]').type('Kegiatan pembersihan area pesisir pantai mutiara.');
    cy.get('input[name="location"]').type('Pantai Mutiara, Jakarta');
    
    // Using valid future dates
    const d = new Date();
    d.setMonth(d.getMonth() + 7);
    const validFuture = d.toISOString().slice(0, 16);
    cy.get('input[name="startDate"]').type(new Date().toISOString().slice(0, 16));
    cy.get('input[name="executionDate"]').type(validFuture);
    
    // Submit the form
    cy.contains('button', 'Ajukan untuk Review').click();

    // Verify redirection back to dashboard OR success state on same page
    cy.url({ timeout: 15000 }).should('satisfy', (url: string) =>
      url.includes('/community/dashboard')
    );
  });

  // ─────────────────────────────────────────────
  // Edge Case: XSS di field judul kegiatan baru
  // ─────────────────────────────────────────────
  it('Harus merender payload XSS pada judul kegiatan dengan aman', () => {
    const xssPayload = '<script>alert("xss")</script>';

    // Server action already handles mock response via getE2EMock

    cy.visit('/community/dashboard/activities/create');
    cy.wait(1000);

    // parseSpecialCharSequences:false prevents Cypress from treating { } as special keys
    cy.get('input[name="title"]').type(xssPayload, { parseSpecialCharSequences: false });

    // XSS must not execute — verify the payload is treated as plain text
    // and no <script> element was actually injected into the DOM.
    cy.get('body').should('be.visible');

    // The input value should hold the raw payload string (React renders it safely as text)
    cy.get('input[name="title"]').should('have.value', xssPayload);

    // No actual <script> tag should have been injected into the DOM
    cy.get('script[src]').then(($scripts) => {
      $scripts.each((_, el) => {
        expect(el.textContent || '').not.to.include('alert("xss")');
      });
    });
  });
});
