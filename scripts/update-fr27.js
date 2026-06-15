const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-27_persetujuan_pendaftar_relawan';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove any remaining cy.intercept
    content = content.replace(/cy\.intercept\([\s\S]*?\}\);\n/g, '');
    
    // Remove any cy.setCookie
    content = content.replace(/cy\.setCookie\([^)]+\);\n/g, '');

    // Replace the beforeEach block entirely
    let replacementBeforeEach = `beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // comm1
    });`;

    if (file.includes('TC_02')) {
        replacementBeforeEach = `beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner2@example.com', 'Password@2026'); // comm2
    });`;
    } else if (file.includes('TC_05')) {
        replacementBeforeEach = `beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner3@example.com', 'Password@2026'); // comm3
    });`;
    }

    content = content.replace(/beforeEach\(\(\) => \{[\s\S]*?\}\);/, replacementBeforeEach);

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
