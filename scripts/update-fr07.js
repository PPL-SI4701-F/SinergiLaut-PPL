const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-07_pencarian_filter_kegiatan';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

const replacement = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Halaman ini publik, namun kita login sebagai user biasa agar konsisten.
        // Data diambil dari database asli tanpa mock.
        cy.login('approved1@user.com', 'Password@2026');
    });`;

function replaceBeforeEach(content) {
    const startIndex = content.indexOf('    beforeEach(() => {');
    const endIndex = content.indexOf('    });\n\n    it(', startIndex);
    if (startIndex !== -1 && endIndex !== -1) {
        return content.substring(0, startIndex) + replacement + content.substring(endIndex + 7);
    }
    // Try without double newline
    const endIndex2 = content.indexOf('    });\n    it(', startIndex);
    if (startIndex !== -1 && endIndex2 !== -1) {
        return content.substring(0, startIndex) + replacement + content.substring(endIndex2 + 7);
    }
    return content;
}

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace beforeEach
    content = replaceBeforeEach(content);
    
    // Replace titles
    content = content.replace(/'Bersih Pantai Mutiara'/g, "'Edukasi Pesisir untuk Anak Lombok'");
    content = content.replace(/'Tanam Mangrove Asri'/g, "'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik'");
    content = content.replace(/'Konservasi Terumbu Karang'/g, "'Rehabilitasi Terumbu Karang Menjangan'");
    
    // Replace Locations and Categories and Search terms
    content = content.replace(/'Jakarta'/g, "'NTB'"); // Edukasi Pesisir is in NTB
    content = content.replace(/'Mangrove'/g, "'Kuta'");
    
    // Note: The UI might show "Bali" as an option. The db location is "Pantai Kuta, Badung, Bali". The filter should have "Bali".
    // "Coral & ecosystem restoration" is likely the UI text for "restoration" category.
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
