const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-09_manajemen_donasi';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

const replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026');
        
        // Ambil ID kegiatan "Bersih Pantai Kuta — Aksi Nyata Lawan Plastik" dari database riil
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').as('activityId');
    });`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace beforeEach
    const startBeforeEach = content.indexOf('    beforeEach(() => {');
    const endBeforeEach = content.indexOf('    });\n    it(', startBeforeEach);
    let endIt = endBeforeEach;
    if(endBeforeEach === -1) {
        endIt = content.indexOf('    });\n\n    it(', startBeforeEach);
    }
    
    if (startBeforeEach !== -1 && endIt !== -1) {
        content = content.substring(0, startBeforeEach) + replacementBeforeEach + content.substring(endIt + 7);
    }
    
    // Fix TC_05 which logs in as user
    if (file.includes('TC_05')) {
        content = content.replace(/cy\.clearCookies\(\);\s*cy\.setCookie\('e2e-bypass-auth', 'user'\);/, 
        `cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('pending1@user.com', 'Password@2026');`);
    }

    // Replace cy.visit
    content = content.replace(/cy\.visit\('\/community\/dashboard\/activities\/mock-activity-123\/donors'\);/g, 
        `cy.get('@activityId').then((id) => {
            cy.visit(\`/community/dashboard/activities/\${id}/donors\`);
        });`);

    // Replace Names and Amounts
    content = content.replace(/'Budi'/g, "'Budi Santoso'");
    content = content.replace(/'Ani'/g, "'Wahyu Hidayat'");
    content = content.replace(/'Rp 50\.000'/g, "'Rp 500.000'");
    content = content.replace(/'Rp 100\.000'/g, "'Rp 3.000.000'");

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
