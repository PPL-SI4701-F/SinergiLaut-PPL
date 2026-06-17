const fs = require('fs');
const path = require('path');

const e2eDir = path.join(__dirname, 'cypress', 'e2e');
const items = fs.readdirSync(e2eDir);

for (const item of items) {
  if (item.startsWith('FR-12') || item.startsWith('FR-32')) {
    console.log(`Keeping ${item}`);
    continue;
  }
  
  const itemPath = path.join(e2eDir, item);
  try {
    fs.rmSync(itemPath, { recursive: true, force: true });
    console.log(`Deleted ${item}`);
  } catch (err) {
    console.error(`Failed to delete ${item}:`, err);
  }
}
