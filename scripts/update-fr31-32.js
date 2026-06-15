const fs = require('fs');
const path = require('path');

// Update FR-31
const dir31 = 'cypress/e2e/FR-31_pelaporan_penggunaan_dana';
if (fs.existsSync(dir31)) {
    const files = fs.readdirSync(dir31).filter(f => f.endsWith('.cy.ts'));
    files.forEach(file => {
        const filePath = path.join(dir31, file);
        let content = fs.readFileSync(filePath, 'utf8');

        content = content.replace(/cy\.intercept\([\s\S]*?\}\);\n/g, '');
        content = content.replace(/cy\.setCookie\([^)]+\);\n/g, '');
        
        let replacementBeforeEach = `beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner2@example.com', 'Password@2026'); // comm2
    });`;
        content = content.replace(/beforeEach\(\(\) => \{[\s\S]*?\}\);/, replacementBeforeEach);

        content = content.replace(
            /cy\.visit\('\/community\/dashboard\/activities\/act-1\/report'\);/g,
            "cy.task('getActivityIdByTitle', 'Survei Populasi Ikan Karang Wakatobi').then((id) => cy.visit(`/community/dashboard/activities/${id}/report`));"
        );

        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    });
}

// Update FR-32
const dir32 = 'cypress/e2e/FR-32_validasi_pencairan_dana';
if (fs.existsSync(dir32)) {
    const files = fs.readdirSync(dir32).filter(f => f.endsWith('.cy.ts'));
    files.forEach(file => {
        const filePath = path.join(dir32, file);
        let content = fs.readFileSync(filePath, 'utf8');

        content = content.replace(/cy\.intercept\([\s\S]*?\}\);\n/g, '');
        content = content.replace(/cy\.setCookie\([^)]+\);\n/g, '');
        
        // Custom bypass-auth removal for TC_15 which doesn't have beforeEach
        content = content.replace(/cy\.setCookie\('e2e-bypass-auth', 'community'\);[ \t]*\/\/[^\n]*\n/g, "cy.login('owner1@example.com', 'Password@2026');\n");
        content = content.replace(/cy\.setCookie\('e2e-bypass-auth', 'community'\);/g, "cy.login('owner1@example.com', 'Password@2026');");

        if (content.includes('beforeEach')) {
            let replacementBeforeEach = `beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026'); // Admin Utama
    });`;
            content = content.replace(/beforeEach\(\(\) => \{[\s\S]*?\}\);/, replacementBeforeEach);
        }

        content = content.replace(/Komunitas Peduli Laut/g, 'Yayasan Laut Bersih Nusantara');
        content = content.replace(/Rp\s*5[\.,]000[\.,]000/g, 'Rp 2.000.000');
        content = content.replace(/Komunitas Laut Hijau/g, 'Gerakan Pesisir Hijau Lombok');
        
        content = content.replace(/Laporan Bersih Pantai Mutiara/g, 'Laporan Pertanggungjawaban: Bersih Pantai Besar Bunaken');
        content = content.replace(/Eco Ocean/g, 'Yayasan Laut Bersih Nusantara');

        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    });
}
