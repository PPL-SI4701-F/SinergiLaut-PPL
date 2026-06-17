const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-06_manajemen_status_kegiatan';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

const replacement = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role admin.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });`;

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
    
    // Replace beforeEach
    content = replaceBeforeEach(content);
    
    // Replace titles
    content = content.replace(/'Pending Activity 1'/g, "'Edukasi Lingkungan Laut untuk Pelajar SD'");
    content = content.replace(/'Pending Activity 2'/g, "'Pemantauan Terumbu Karang Amed'");
    content = content.replace(/'Ongoing Activity 1'/g, "'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik'");
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
