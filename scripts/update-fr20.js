const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-20_dashboard_admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove intercepts and aliases
    content = content.replace(/cy\.intercept\([\s\S]*?\.as\('[^']+'\);\n/g, '');
    
    // Default replace beforeEach
    let replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026'); // Admin Utama
    });`;

    // For tests that need an empty state, we process the pending items first
    if (file.includes('TC_31') || file.includes('TC_32') || file.includes('TC_33') || file.includes('TC_34')) {
        replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026'); // Admin Utama
        
        // Clear pending data by approving them (for empty state tests)
        cy.visit('/admin/dashboard');
        cy.wait(1000);
        
        cy.get('body').then($body => {
            // Approve communities
            if ($body.find('button:contains("Setujui")').length > 0) {
                cy.get('button').contains('Setujui').click({ multiple: true, force: true });
                cy.wait(1000);
            }
            // Approve activities (green check button)
            if ($body.find('button.bg-green-600').length > 0) {
                cy.get('button.bg-green-600').click({ multiple: true, force: true });
                cy.wait(1000);
            }
        });
    });`;
    }

    const startBeforeEach = content.indexOf('    beforeEach(() => {');
    const endBeforeEach = content.indexOf('    });\n    it(', startBeforeEach);
    let endIt = endBeforeEach;
    if(endBeforeEach === -1) {
        endIt = content.indexOf('    });\n\n    it(', startBeforeEach);
    }
    
    if (startBeforeEach !== -1 && endIt !== -1) {
        content = content.substring(0, startBeforeEach) + replacementBeforeEach + content.substring(endIt + 7);
    }

    // Name replacements for real seed data
    content = content.replace(/Eco Ocean/g, "Forum Konservasi Laut Maluku");
    content = content.replace(/Pending Activity 1/g, "Edukasi Lingkungan Laut untuk Pelajar SD");
    content = content.replace(/Pending Activity 2/g, "Pemantauan Terumbu Karang Amed");
    content = content.replace(/Pembersihan Pantai/g, "Laporan Pertanggungjawaban: Bersih Pantai Besar Bunaken");

    if (file.includes('TC_18')) {
        // Specifically for TC_18, it checks the community name of the pending activity
        // Edukasi Lingkungan is by Yayasan Laut Bersih Nusantara
        content = content.replace(/Forum Konservasi Laut Maluku/g, "Yayasan Laut Bersih Nusantara");
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
