const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-05_manajemen_kegiatan_konservasi';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

const replacement = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role community.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('owner1@example.com', 'Password@2026');
    });`;

const searchRegex = /    beforeEach\(\(\) => \{[\s\S]*?\}\);/g;

// Actually the beforeEach block has two cy.intercepts inside it. We want to replace the first `beforeEach(() => { ... });` in the file.
// Let's do it safely:
function replaceBeforeEach(content) {
    const startIndex = content.indexOf('    beforeEach(() => {');
    const endIndex = content.indexOf('    });\n    it(', startIndex);
    if (startIndex !== -1 && endIndex !== -1) {
        return content.substring(0, startIndex) + replacement + content.substring(endIndex + 7);
    }
    return content;
}

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace beforeEach carefully
    content = replaceBeforeEach(content);
    
    // Replace titles
    content = content.replace(/'Konservasi Mangrove Cilincing'/g, "'Rencana Bersih Pantai Sanur'");
    content = content.replace(/'Pemantauan Koral Kepulauan Seribu'/g, "'Edukasi Lingkungan Laut untuk Pelajar SD'");
    content = content.replace(/'Tanam Mangrove Pulau Tidung'/g, "'Festival Laut Nusantara 2026'");
    content = content.replace(/'Restorasi Ekosistem Pantai Kramat'/g, "'Ekspedisi Terumbu Karang Raja Ampat'");
    content = content.replace(/'Bersih Pantai Mutiara'/g, "'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik'");
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
