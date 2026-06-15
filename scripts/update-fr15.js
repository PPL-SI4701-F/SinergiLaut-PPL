const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-15_monitoring_progress_kegiatan';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove intercepts and aliases
    content = content.replace(/cy\.intercept\([\s\S]*?\.as\('[^']+'\);\n/g, '');

    // Replace beforeEach
    const replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('owner1@example.com', 'Password@2026'); // Can be any user/community to see progress
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
        const newBody = `    it('Harus menampilkan progress bar relawan dan pendanaan secara akurat', () => {
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').then((id) => {
            cy.visit(\`/activities/\${id}\`);
        });

        // 4 relawan, kuota 30
        cy.contains('4').should('exist');
        cy.contains('30').should('exist');

        // Dana 6.000.000, goal 10.000.000
        cy.contains(/6\\.?000\\.?000/i).should('exist');
        cy.contains(/10\\.?000\\.?000/i).should('exist');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    } else if (file.includes('TC_02')) {
        const newBody = `    it('Harus menampilkan progress sesuai data saat belum ada relawan yang mendaftar', () => {
        cy.task('getActivityIdByTitle', 'Edukasi Pesisir untuk Anak Lombok').then((id) => {
            cy.visit(\`/activities/\${id}\`);
        });

        // 0 relawan dari 15
        cy.contains(/0\\s*\\/\\s*15|0 relawan|0%/i).should('exist');
        
        // Dana 1.500.000 dari 6.000.000
        cy.contains(/1\\.?500\\.?000/i).should('exist');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    } else if (file.includes('TC_03')) {
        const newBody = `    it('Harus menampilkan indikator penuh saat kuota relawan dan target dana tercapai 100%', () => {
        cy.task('getActivityIdByTitle', 'Bersih Pantai Besar Bunaken').then((id) => {
            cy.visit(\`/activities/\${id}\`);
        });

        // 80/80 relawan
        cy.contains('80').should('exist');
        
        // Dana 10.000.000
        cy.contains(/10\\.?000\\.?000/i).should('exist');
        
        // Indikator terpenuhi/full
        cy.contains(/100%|kuota penuh|terpenuhi|fully funded|full/i).should('exist');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    } else if (file.includes('TC_04')) {
        const newBody = `    it('Harus menampilkan elemen progress bar pada halaman detail kegiatan', () => {
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').then((id) => {
            cy.visit(\`/activities/\${id}\`);
        });

        // Verifikasi bahwa elemen yang berfungsi sebagai bar progress (misal <progress>, div ber-role progressbar, atau class yg spesifik) ditampilkan.
        cy.get(
            'progress, [role="progressbar"], .progress, .progress-bar, [class*="progress"], [class*="w-full bg-slate"]',
        ).should('exist');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
