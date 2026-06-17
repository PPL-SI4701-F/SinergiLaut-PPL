const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-13_notifikasi_realtime';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace beforeEach with empty
    const startBeforeEach = content.indexOf('    beforeEach(() => {');
    const endBeforeEach = content.indexOf('    });\n    it(', startBeforeEach);
    let endIt = endBeforeEach;
    if(endBeforeEach === -1) {
        endIt = content.indexOf('    });\n\n    it(', startBeforeEach);
    }
    
    let replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('userPending2@user.com', 'Password@2026');
    });`;

    if (file.includes('TC_04')) {
        replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('userApproved2@user.com', 'Password@2026'); // has unread notification
    });`;
    } else if (file.includes('TC_05')) {
        replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026');
    });`;
    } else if (file.includes('TC_06')) {
        replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });`;
    }

    if (startBeforeEach !== -1 && endIt !== -1) {
        content = content.substring(0, startBeforeEach) + replacementBeforeEach + content.substring(endIt + 7);
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
