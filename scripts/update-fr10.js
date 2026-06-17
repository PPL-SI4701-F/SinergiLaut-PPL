const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-10_manajemen_batas_waktu_donasi';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace beforeEach
    const replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved2@user.com', 'Password@2026');
    });`;

    const startBeforeEach = content.indexOf('    beforeEach(() => {');
    const endBeforeEach = content.indexOf('    });\n\n    it(', startBeforeEach);
    let endIt = endBeforeEach;
    if(endBeforeEach === -1) {
        endIt = content.indexOf('    });\n    it(', startBeforeEach);
    }
    
    if (startBeforeEach !== -1 && endIt !== -1) {
        content = content.substring(0, startBeforeEach) + replacementBeforeEach + content.substring(endIt + 7);
    }

    if (file.includes('TC_01')) {
        // Active activity
        const newBody = `    it('Harus mengizinkan donasi jika batas waktu (end_date) masih di masa depan', () => {
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').then((id) => {
            cy.visit(\`/activities/\${id}\`);
        });

        // The donation form/button should exist and be enabled
        cy.contains('button', /Donasi/i).should('not.be.disabled');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    } else if (file.includes('TC_02')) {
        // Expired activity
        const newBody = `    it('Harus memblokir donasi jika batas waktu (end_date) sudah lewat', () => {
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id) => {
            cy.visit(\`/activities/\${id}\`);
        });

        // The donation button should be disabled and show warning
        cy.contains('button', /Batas Waktu Habis/i).should('be.disabled');
        cy.contains(/Batas waktu pengumpulan habis/i).should('exist');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
