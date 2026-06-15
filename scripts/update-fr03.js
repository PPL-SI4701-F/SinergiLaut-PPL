const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-03_kelola_profil_pengguna';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

const replacement = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan status relawan 'pending'.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('pending1@user.com', 'Password@2026');
    });`;

const searchRegex = /    beforeEach\(\(\) => \{[\s\S]*?\}\)\.as\('getProfile'\);\n    \}\);/g;

files.forEach(file => {
    if (file === 'FR-03_kelola_profil_pengguna_TC_01.cy.ts') return;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(searchRegex, replacement);
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
