const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-32_validasi_pencairan_dana';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace cy.wait(1000) with a UI assertion after visit
  content = content.replace(/cy\.visit\('([^']+)'\);\s*cy\.wait\(\d+\);/g, (match, url) => {
    if (url.includes('/admin/disbursements')) {
      return `cy.visit('${url}');\n        cy.contains('h1', /Pencairan Dana/i, { timeout: 10000 }).should('be.visible');`;
    } else if (url.includes('/admin/dashboard')) {
      return `cy.visit('${url}');\n        cy.contains('h1', /Dashboard/i, { timeout: 10000 }).should('be.visible');`;
    } else if (url.includes('/community/endowment')) {
      return `cy.visit('${url}');\n        cy.contains('h1', /Dana Abadi/i, { timeout: 10000 }).should('be.visible');`;
    } else if (url.includes('/endowment')) {
      return `cy.visit('${url}');\n        cy.contains('h1', /Dana Abadi/i, { timeout: 10000 }).should('be.visible');`;
    }
    return `cy.visit('${url}');\n        cy.get('body', { timeout: 10000 }).should('be.visible');`;
  });

  // Replace the `it('FR 32 - TC XX - ...')` with `it('FR 32 - ... - TC XX')`
  content = content.replace(/it\('FR 32 - TC (\d+) - ([^']+)',/g, (match, tcNum, desc) => {
    return `it('FR 32 - ${desc} - TC ${tcNum}',`;
  });

  // Fix comments that say data comes from E2E mock
  content = content.replace(/\/\/ Data pencairan berasal dari mock E2E.*/g, '// Data pencairan berasal dari prisma/seed.ts');
  content = content.replace(/\/\/ Mock getAdminReportsList.*/g, '// Data berasal dari prisma/seed.ts');

  // Fix hardcoded "Gerakan Pesisir Hijau Lombok" to a real community from seed
  // The seed has "Konservasi Laut Bali" (owner1@example.com)
  content = content.replace(/Gerakan Pesisir Hijau Lombok/g, 'Konservasi Laut Bali');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${file}`);
}
