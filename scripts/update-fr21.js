const fs = require('fs');
const path = require('path');

const dir1 = 'cypress/e2e/FR-21_membuat_kegiatan';
if (fs.existsSync(dir1)) {
    const files1 = fs.readdirSync(dir1).filter(f => f.endsWith('.cy.ts'));
    files1.forEach(file => {
        const filePath = path.join(dir1, file);
        let content = fs.readFileSync(filePath, 'utf8');

        content = content.replace(/cy\.intercept\([\s\S]*?\.as\('[^']+'\);\n/g, '');
        
        let replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // comm1
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

        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    });
}

const dir2 = 'cypress/e2e/FR-21_mencari_aktivitas_relawan';
if (fs.existsSync(dir2)) {
    const files2 = fs.readdirSync(dir2).filter(f => f.endsWith('.cy.ts'));
    files2.forEach(file => {
        const filePath = path.join(dir2, file);
        let content = fs.readFileSync(filePath, 'utf8');

        content = content.replace(/cy\.intercept\([\s\S]*?\.as\('[^']+'\);\n/g, '');
        
        // Remove cy.wait for intercepted aliases
        content = content.replace(/cy\.wait\('@getAllActivities'\);\n/g, '');

        if (file.includes('TC_01')) {
            content = content.replace(/Bersih Pantai Mutiara/g, "Bersih Pantai Kuta");
            content = content.replace(/Tanam Mangrove/g, "Transplantasi Karang Takabonerate");
            content = content.replace(/'Jakarta'/g, "'Sulawesi Selatan'");
            content = content.replace(/'Coral & Ecosystem Restoration'/g, "'Coral_restoration'");
        } else if (file.includes('TC_02') || file.includes('TC_03') || file.includes('TC_04') || file.includes('TC_06')) {
            content = content.replace(/Bersih Pantai Mutiara/g, "Bersih Pantai Kuta");
            content = content.replace(/Tanam Mangrove/g, "Transplantasi Karang Takabonerate");
        } else if (file.includes('TC_05')) {
            content = content.replace(/Bersih Pantai Mutiara/g, "Bersih Pantai Kuta");
            content = content.replace(/Tanam Mangrove/g, "Transplantasi Karang Takabonerate");
        }

        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    });
}
