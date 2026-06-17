const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-08_pendaftaran_relawan';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

const replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role user.
        // Data diambil langsung dari database. Kita navigasi ke detail kegiatan secara E2E untuk menghindari hardcode UUID.
        cy.login('approved2@user.com', 'Password@2026');
        cy.visit('/activities');
        cy.contains('Bersih Pantai Kuta').click({ force: true });
        // Pastikan sudah masuk ke halaman detail
        cy.contains('button', 'Daftar Relawan').should('be.visible');
    });`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the const activityId = 'mock-activity-123';
    content = content.replace(/const activityId = 'mock-activity-123';\s*/g, '');
    
    // Replace the beforeEach block
    const startBeforeEach = content.indexOf('    beforeEach(() => {');
    const endBeforeEach = content.indexOf('    });\n\n    it(', startBeforeEach);
    let endIt = endBeforeEach;
    if(endBeforeEach === -1) {
        endIt = content.indexOf('    });\n    it(', startBeforeEach);
    }
    
    if (startBeforeEach !== -1 && endIt !== -1) {
        content = content.substring(0, startBeforeEach) + replacementBeforeEach + content.substring(endIt + 7);
    }
    
    // Remove cy.visit(/activities/${activityId});
    content = content.replace(/cy\.visit\(`\/activities\/\$\{activityId\}`\);\s*/g, '');
    
    // Remove cy.wait('@getActivity');
    content = content.replace(/cy\.wait\('@getActivity'\);\s*/g, '');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
