const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-11_pelaporan_kegiatan_transparansi_dana';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove intercepts and replace beforeEach
    const replacementBeforeEach = `    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved2@user.com', 'Password@2026');
    });`;

    const startBeforeEach = content.indexOf('    beforeEach(() => {');
    let endBeforeEach = content.indexOf('    });\n\n    it(', startBeforeEach);
    if(endBeforeEach === -1) {
        endBeforeEach = content.indexOf('    });\n    it(', startBeforeEach);
    }
    
    if (startBeforeEach !== -1 && endBeforeEach !== -1) {
        content = content.substring(0, startBeforeEach) + replacementBeforeEach + content.substring(endBeforeEach + 7);
    }

    if (file.includes('TC_01')) {
        const newBody = `    it('Harus menampilkan laporan transparansi untuk kegiatan yang telah selesai', () => {
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id) => {
            cy.visit(\`/activities/\${id}\`);
        });

        cy.contains(/Transparansi|Laporan|Penggunaan Dana/i).click({ force: true });

        cy.contains('Sewa Kapal dan Transportasi Laut').should('be.visible');
        cy.contains('Rp 4.500.000').should('be.visible');

        cy.contains('Konsumsi dan Logistik Relawan').should('be.visible');
        cy.contains('Rp 2.000.000').should('be.visible');

        cy.contains('Total Penggunaan').should('be.visible');
        cy.contains('Rp 15.000.000').should('exist');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    } else if (file.includes('TC_02')) {
        const newBody = `    it('Harus menampilkan kondisi kosong saat kegiatan selesai belum memiliki laporan', () => {
        cy.task('getActivityIdByTitle', 'Survei Populasi Ikan Karang Wakatobi').then((id) => {
            cy.visit(\`/activities/\${id}\`);
        });

        cy.contains(/Transparansi|Laporan|Penggunaan Dana/i).click({ force: true });

        // Verify the empty state message is shown
        cy.contains(/belum ada laporan|tidak ada laporan|no report|laporan belum tersedia/i).should(
            'be.visible'
        );
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    } else if (file.includes('TC_03')) {
        const newBody = `    it('Harus tidak menampilkan item laporan yang belum tervalidasi (status bukan "validated")', () => {
        cy.task('getActivityIdByTitle', 'Bersih Pantai Besar Bunaken').then((id) => {
            cy.visit(\`/activities/\${id}\`);
        });

        cy.contains(/Transparansi|Laporan|Penggunaan Dana/i).click({ force: true });

        // "Bersih Pantai Besar Bunaken" report status is 'submitted', so it's not validated. 
        // Thus, none of its fund items should be visible yet.
        cy.contains('Peralatan Kebersihan').should('not.exist');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    } else if (file.includes('TC_04')) {
        const newBody = `    it('Harus menghitung total pengeluaran secara akurat dari banyak item laporan', () => {
        cy.task('getActivityIdByTitle', 'Ekspedisi Terumbu Karang Raja Ampat').then((id) => {
            cy.visit(\`/activities/\${id}\`);
        });

        cy.contains(/Transparansi|Laporan|Penggunaan Dana/i).click({ force: true });

        cy.contains('Peralatan Selam dan Safety').should('be.visible');
        cy.contains('Dokumentasi dan Publikasi').should('be.visible');
        cy.contains('Bibit Karang dan Media Tanam').should('be.visible');

        cy.contains('Total Penggunaan').should('be.visible');
        cy.contains('Rp 15.000.000').should('exist');
    });
});`;
        const startIt = content.indexOf('    it(');
        content = content.substring(0, startIt) + newBody;
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
