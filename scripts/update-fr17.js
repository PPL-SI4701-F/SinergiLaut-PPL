const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-17_riwayat_aktivitas_pengguna';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace intercept and get*Activity aliases
    content = content.replace(/cy\.intercept\([\s\S]*?\.as\('[^']+'\);\n/g, '');
    
    // Default replace beforeEach (will be customized per file)
    let replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved1@user.com', 'Password@2026');
    });`;

    if (file.includes('TC_03')) {
        replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('pending2@user.com', 'Password@2026');
    });`;
    } else if (file.includes('TC_04')) {
        replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved4@user.com', 'Password@2026');
    });`;
    }

    const startBeforeEach = content.indexOf('    beforeEach(() => {');
    const endBeforeEach = content.indexOf('    });\n    it(', startBeforeEach);
    let endIt = endBeforeEach;
    if(endBeforeEach === -1) {
        endIt = content.indexOf('    });\n\n    it(', startBeforeEach);
    }
    
    if (startBeforeEach !== -1 && endIt !== -1) {
        content = content.substring(0, startBeforeEach) + replacementBeforeEach + content.substring(endIt + 7);
    }

    // Now update test bodies
    if (file.includes('TC_01')) {
        const newBody = `    it('Harus menampilkan riwayat kegiatan di dashboard pengguna', () => {
        cy.visit(\`/user/dashboard\`);
        
        // Use realistic names from DB
        cy.contains('Ekspedisi Terumbu Karang Raja Ampat').should('exist');
        cy.contains(/attended|selesai|hadir/i).should('exist');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    } else if (file.includes('TC_02')) {
        const newBody = `    it('Harus menampilkan beberapa entri riwayat dengan status pendaftaran yang berbeda-beda', () => {
        cy.visit(\`/user/dashboard\`);
        
        // These are activities approved1 is registered to
        cy.contains('Bersih Pantai Kuta').should('exist');
        cy.contains('Rehabilitasi Terumbu Karang Menjangan').should('exist');
        cy.contains('Ekspedisi Terumbu Karang Raja Ampat').should('exist');

        cy.contains(/attended|selesai|hadir/i).should('exist');
        cy.contains(/approved|diterima|disetujui/i).should('exist');
        cy.contains(/pending|menunggu/i).should('exist');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    } else if (file.includes('TC_03')) {
        const newBody = `    it('Harus menampilkan kondisi kosong saat pengguna belum pernah mendaftar kegiatan apa pun', () => {
        cy.visit(\`/user/dashboard\`);
        
        cy.contains(/belum ada|tidak ada|no activity|belum pernah|belum mengikuti/i).should(
            'be.visible'
        );
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    } else if (file.includes('TC_04')) {
        const newBody = `    it('Harus menampilkan status "ditolak" pada riwayat pendaftaran yang tidak diterima komunitas', () => {
        cy.visit(\`/user/dashboard\`);
        
        // Transplantasi Karang Takabonerate is rejected for userApproved4
        cy.contains('Transplantasi Karang Takabonerate').should('exist');
        cy.contains(/rejected|ditolak/i).should('exist');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
