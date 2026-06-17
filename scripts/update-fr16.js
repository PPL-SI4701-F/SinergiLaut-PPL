const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-16_dashboard_pengguna';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace intercept and get*Activity aliases
    content = content.replace(/cy\.intercept\([\s\S]*?\.as\('[^']+'\);\n/g, '');
    
    // Replace beforeEach
    let replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved1@user.com', 'Password@2026'); // Dian Rahmawati
    });`;

    const startBeforeEach = content.indexOf('    beforeEach(() => {');
    const endBeforeEach = content.indexOf('    });\n    it(', startBeforeEach);
    let endIt = endBeforeEach;
    if(endBeforeEach === -1) {
        endIt = content.indexOf('    });\n\n    it(', startBeforeEach);
    }
    
    if (startBeforeEach !== -1 && endIt !== -1) {
        content = content.substring(0, startBeforeEach) + replacementBeforeEach + content.substring(endIt + 7);
    }

    if (file.includes('TC_01')) {
        content = content.replace(/'Mock User'/g, "'Dian Rahmawati'");
    } else if (file.includes('TC_02')) {
        const newBody = `    it('Harus menampilkan kartu statistik: kegiatan diikuti, total donasi, dan status aktif', () => {
        cy.visit('/user/dashboard');
        cy.wait(1000);

        cy.contains('Kegiatan Diikuti').should('be.visible');
        cy.contains('Total Donasi').should('be.visible');
        cy.contains('Kegiatan Aktif').should('be.visible');

        // Verify the values are non-empty numbers
        cy.contains('Kegiatan Diikuti')
            .parents('.rounded-2xl')
            .within(() => {
                cy.get('p').eq(1).invoke('text').should('match', /^[0-9]+$/);
            });

        cy.contains('Kegiatan Aktif')
            .parents('.rounded-2xl')
            .within(() => {
                cy.get('p').eq(1).invoke('text').should('match', /^[0-9]+$/);
            });
            
        cy.contains('Total Donasi')
            .parents('.rounded-2xl')
            .within(() => {
                cy.get('p').eq(1).invoke('text').should('match', /^(Rp\\s?)?[\\d.,]+$/);
            });
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
