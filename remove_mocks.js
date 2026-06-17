const fs = require('fs');

function removeMocks(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace getE2EMock logic
  content = content.replace(/const isE2E = await getE2EMock\(\)/g, 'const isE2E = null');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Removed mocks from ${filePath}`);
}

removeMocks('lib/actions/disbursement.actions.ts');
removeMocks('lib/actions/dashboard.actions.ts');
removeMocks('lib/actions/endowment.actions.ts');
