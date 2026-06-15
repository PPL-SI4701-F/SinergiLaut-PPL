const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-04_verifikasi_akun_komunitas';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

const replacement = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role admin.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });`;

const searchRegex = /    beforeEach\(\(\) => \{\s*cy\.clearCookies\(\);\s*cy\.clearLocalStorage\(\);\s*cy\.setCookie\('e2e-bypass-auth', 'admin'\);\s*\}\);/g;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace beforeEach
    content = content.replace(searchRegex, replacement);
    
    // Replace 'Eco Ocean' with 'Forum Konservasi Laut Maluku'
    content = content.replace(/'Eco Ocean'/g, "'Forum Konservasi Laut Maluku'");
    
    // Specifically for TC_06
    if (file.includes('TC_06')) {
        content = content.replace(/'Komunitas Mangrove Asri'/g, "'Relawan Mangrove Kalimantan'");
        content = content.replace(/'Komunitas Laut Lestari'/g, "'Yayasan Laut Bersih Nusantara'");
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
