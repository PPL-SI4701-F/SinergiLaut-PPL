const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-14_rating_feedback_kegiatan';
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
        cy.login('approved3@user.com', 'Password@2026'); // Maya Sari
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
        const newBody = `    it('Harus mengizinkan pengguna mengirim ulasan dan menampilkannya di halaman publik', () => {
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id) => {
            cy.visit(\`/activities/\${id}?tab=feedback\`);
        });
        cy.wait(1000);

        // Click stars
        cy.get('.flex.items-center.gap-1 button').last().click({ force: true });
        
        // Type review
        cy.get('textarea').clear().type('Bagus!');
        
        // Submit
        cy.contains('button', /Kirim|Submit|Perbarui/i).click();
        
        // Reload page to verify it persisted
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id) => {
            cy.visit(\`/activities/\${id}?tab=feedback\`);
        });

        // The review text we just typed
        cy.contains('Bagus!').should('be.visible');
        
        // The reviewer's name (Maya Sari)
        cy.contains('Maya Sari').should('be.visible');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    } else if (file.includes('TC_02')) {
        const newBody = `    it('Harus menampilkan semua feedback dari beberapa pengguna berbeda', () => {
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id) => {
            cy.visit(\`/activities/\${id}?tab=feedback\`);
        });
        cy.wait(1000);

        // Dian Rahmawati's feedback
        cy.contains('Kegiatan luar biasa!').should('be.visible');
        cy.contains('Dian Rahmawati').should('be.visible');

        // Fajar Nugroho's feedback
        cy.contains('Sangat bermanfaat.').should('be.visible');
        cy.contains('Fajar Nugroho').should('be.visible');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    } else if (file.includes('TC_03')) {
        const newBody = `    it('Harus menampilkan kondisi kosong saat belum ada feedback pada kegiatan', () => {
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').then((id) => {
            cy.visit(\`/activities/\${id}?tab=feedback\`);
        });
        cy.wait(1000);

        cy.contains(/belum ada ulasan|belum ada feedback|no review|no feedback|belum ada komentar/i).should('be.visible');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    } else if (file.includes('TC_04')) {
        const newBody = `    it('Harus menampilkan nilai rating (bintang atau angka) pada setiap ulasan yang ada', () => {
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id) => {
            cy.visit(\`/activities/\${id}?tab=feedback\`);
        });
        cy.wait(1000);

        // Assert the review is shown
        cy.contains('Kegiatan luar biasa!').should('be.visible');
        cy.contains('Dian Rahmawati').should('be.visible');

        // Check if rating value or stars is rendered
        cy.contains(/^5$|★★★★★|5 bintang|5\\/5/i).should('exist');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
