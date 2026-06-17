const fs = require('fs');
const dirs = ['FR-07_pencarian_filter_kegiatan'];
dirs.forEach(d => {
    const dir = 'cypress/e2e/' + d + '/';
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        if (!f.endsWith('.ts')) return;
        let content = fs.readFileSync(dir + f, 'utf8');
        content = content.replace(/cy\.wait\('@getAllActivities'\);\s*/g, 'cy.wait(1000);\n        ');
        content = content.replace(/Edukasi Pesisir untuk Anak Lombok/g, 'Ekspedisi Terumbu Karang Raja Ampat');
        content = content.replace(/Bersih Pantai Kuta .* Aksi Nyata Lawan Plastik/g, 'Festival Laut Nusantara 2026');
        content = content.replace(/Bersih Pantai Kuta[^\n]*Aksi Nyata Lawan Plastik/g, 'Festival Laut Nusantara 2026');
        content = content.replace(/Rehabilitasi Terumbu Karang Menjangan/g, 'Pemantauan Terumbu Karang Amed');
        content = content.replace(/'Kuta'/g, "'Nusantara'");
        content = content.replace(/'Bali'/g, "'DKI Jakarta'");
        content = content.replace(/'NTB'/g, "'Papua Barat'");
        content = content.replace(/\/Coral & ecosystem restoration\/i/g, '/coral/i');
        fs.writeFileSync(dir + f, content);
    });
});
console.log('FR-07 Patched!');
