const fs = require('fs');
const path = require('path');

const dir = 'cypress/e2e/FR-32_validasi_pencairan_dana';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cy.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add before hook to reset DB if it doesn't exist
  if (!content.includes('cy.exec(\'npx prisma db seed\')')) {
    content = content.replace(/beforeEach\(\(\) => {/, "before(() => {\n        cy.exec('npx prisma db seed');\n    });\n\n    beforeEach(() => {");
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Added seed hook to ${file}`);
}
