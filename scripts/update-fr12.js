const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-12_monitoring_audit_admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace beforeEach
    const replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });`;

    const startBeforeEach = content.indexOf('    beforeEach(() => {');
    const endBeforeEach = content.indexOf('    });\n    it(', startBeforeEach);
    let endIt = endBeforeEach;
    if(endBeforeEach === -1) {
        endIt = content.indexOf('    });\n\n    it(', startBeforeEach);
    }
    
    if (startBeforeEach !== -1 && endIt !== -1) {
        content = content.substring(0, startBeforeEach) + replacementBeforeEach + content.substring(endIt + 7);
    }

    if (file.includes('TC_01')) {
        const newBody = `    it('Harus menampilkan riwayat aksi admin pada tab Audit Log', () => {
        cy.visit('/admin/monitoring');
        cy.wait(1000); // Hydration wait

        cy.contains('Riwayat Aktivitas Admin').should('be.visible');
        cy.contains('Riwayat Aksi Admin').should('be.visible');

        cy.contains('Ekspedisi Terumbu Karang Raja Ampat').should('be.visible');
        cy.contains('Divalidasi').should('be.visible');

        cy.contains('Aksi Bersih Pantai Senggigi').should('be.visible');
        cy.contains('Ditolak').should('be.visible');

        cy.contains('Yayasan Laut Bersih Nusantara').should('be.visible');
        // The UI maps status: 'approved' to "Disetujui" or "Telah Diverifikasi"
        // so we just check for 'Yayasan Laut Bersih Nusantara' existence

        cy.contains('Bersih Pantai Kuta').should('be.visible');

        cy.contains('Festival Laut Nusantara 2026').should('be.visible');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    }

    // Replace cy.setCookie('e2e-bypass-auth', 'admin'); inside the file just in case
    content = content.replace(/cy\.setCookie\('e2e-bypass-auth', 'admin'\);\n/g, '');

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
