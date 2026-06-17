const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-19_dashboard_komunitas';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace intercept and get* aliases
    content = content.replace(/cy\.intercept\([\s\S]*?\.as\('[^']+'\);\n/g, '');
    
    // Replace beforeEach
    let replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // comm1
    });`;

    if (file.includes('TC_31')) {
        replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner2@example.com', 'Password@2026'); // comm2 (has no cancelled activities)
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

    // Name replacements for assertions (mapping mock names to comm1's real activities)
    content = content.replace(/Bersih Pantai Mutiara/g, "Bersih Pantai Kuta");
    content = content.replace(/Konservasi Mangrove Cilincing/g, "Rehabilitasi Terumbu Karang Menjangan");
    content = content.replace(/Restorasi Ekosistem Pantai Kramat/g, "Ekspedisi Terumbu Karang Raja Ampat");
    content = content.replace(/Pemantauan Koral Kepulauan Seribu/g, "Edukasi Lingkungan Laut untuk Pelajar SD");
    content = content.replace(/Tanam Mangrove Pulau Tidung/g, "Festival Laut Nusantara 2026");

    // Fix TC_31: change 'Sedang Berlangsung' to 'Dibatalkan' since owner2 has no Dibatalkan
    if (file.includes('TC_31')) {
        content = content.replace(/'Sedang Berlangsung'/g, "'Dibatalkan'");
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
