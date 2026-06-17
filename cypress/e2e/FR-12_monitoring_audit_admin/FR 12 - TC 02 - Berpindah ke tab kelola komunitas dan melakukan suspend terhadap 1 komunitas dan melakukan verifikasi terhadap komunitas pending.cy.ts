function registerCommunityViaUI(communityName: string, email: string) {
    cy.visit('/community/register');
    
    // Step 1: Info Komunitas
    cy.get('input[placeholder*="contoh:"]').type(communityName);
    cy.get('textarea[placeholder*="Deskripsikan misi"]').type(`Deskripsi panjang minimal 20 karakter untuk ${communityName}`);
    cy.get('input[placeholder*="Nama lengkap administrator"]').type('Admin ' + communityName);
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="tel"]').type('081234567890');
    cy.get('input[placeholder="Minimal 8 karakter"]').type('Password@2026');
    cy.get('input[placeholder="Ulangi password"]').type('Password@2026');
    cy.contains('button', 'Lanjut').click();

    // Step 2: Lokasi & Kegiatan
    cy.contains('Pilih wilayah operasional Anda').click();
    cy.contains('Jakarta & Surroundings').click();
    cy.contains('button', 'Beach Cleanup').click();
    cy.contains('button', 'Lanjut').click();

    // Step 3: Dokumen (Upload dummy document to ensure community_verifications is populated)
    cy.get('input[type="file"]#documents-upload').selectFile({
        contents: Cypress.Buffer.from('dummy file content'),
        fileName: 'dummy.pdf',
        mimeType: 'application/pdf',
    }, { force: true });
    
    cy.contains('dummy.pdf').should('be.visible');
    cy.contains('button', 'Lanjut').click();

    // Step 4: Submit
    cy.get('button[role="checkbox"]').click();
    cy.contains('button', 'Kirim Pendaftaran').click();
    
    cy.contains('Pendaftaran Terkirim!', { timeout: 15000 }).should('be.visible');
}

describe('FR-12: Monitoring & audit oleh admin', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('FR 12 - Berpindah ke tab kelola komunitas dan melakukan suspend terhadap 1 komunitas dan melakukan verifikasi terhadap komunitas pending - TC 02', () => {
        // Register 2 communities using the real UI
        registerCommunityViaUI("TC 02 Verify Comm", `verify_${Date.now()}@test.com`);
        registerCommunityViaUI("TC 02 Suspend Comm", `suspend_${Date.now()}@test.com`);

        // Login as admin
        cy.login('admin1@sinergilaut.id', 'Password@2026');

        cy.visit('/admin/communities');
        cy.wait(1000);

        // Verifikasi komunitas (Pending section uses cards, not table)
        cy.contains('TC 02 Verify Comm').should('be.visible');
        cy.contains('TC 02 Verify Comm')
            .parents('.border-yellow-200')
            .within(() => {
                cy.contains('button', 'Verifikasi').click();
            });
        cy.contains('Komunitas berhasil diverifikasi').should('be.visible');

        // Suspend komunitas (Semua Komunitas section uses table)
        cy.contains('TC 02 Suspend Comm').should('be.visible');
        cy.get('table').contains('tr', 'TC 02 Suspend Comm').first().within(() => {
            cy.get('button').click({ force: true }); // Open actions menu
        });
        cy.contains('div[role="menuitem"]', 'Beri Sanksi').click({ force: true });
        cy.get('textarea').type('Melanggar aturan komunitas');
        cy.contains('button', 'Berikan Sanksi').click();
        cy.contains('Sanksi diberikan pada').should('be.visible');
    });
});
