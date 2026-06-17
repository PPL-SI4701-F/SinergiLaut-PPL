const fs = require('fs');
let content = fs.readFileSync('prisma/seed.ts', 'utf8');
content = content.replace("status: i < 2 ? 'approved' : 'pending',", "status: i === 0 ? 'approved' : i === 1 ? 'rejected' : 'pending',");
fs.writeFileSync('prisma/seed.ts', content);
console.log('Seed updated with rejected status for userApproved4');
