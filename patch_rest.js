const fs = require('fs');

const dirs = [
    'cypress/e2e/FR-08_pendaftaran_relawan/',
    'cypress/e2e/FR-09_manajemen_donasi/',
    'cypress/e2e/FR-10_manajemen_batas_waktu_donasi/'
];

dirs.forEach(dir => {
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        if (!f.endsWith('.ts')) return;
        let content = fs.readFileSync(dir + f, 'utf8');

        // Fix corrupted characters and standardize the title
        content = content.replace(/Bersih Pantai Kuta \?" Aksi Nyata Lawan Plastik/g, 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik');
        content = content.replace(/Bersih Pantai Kuta .*" Aksi Nyata Lawan Plastik/g, 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik');
        
        // For FR-10 TC 02: Change target to a completed activity so donation is blocked
        if (f.includes('FR-10_manajemen_batas_waktu_donasi_TC_02')) {
            content = content.replace(/Ekspedisi Terumbu Karang Raja Ampat/g, 'Aksi Bersih Pantai Senggigi');
        }

        fs.writeFileSync(dir + f, content);
    });
});

console.log('FR-08, FR-09, FR-10 Patched!');
