const fs = require('fs');
let content = fs.readFileSync('prisma/seed.ts', 'utf8');

// Replace quota and count for Transplantasi Karang Takabonerate
content = content.replace(
    /fundingGoal: 20_000_000,\s*fundingRaised: 5_000_000,\s*volunteerQuota: 20,\s*volunteerCount: 3,/g,
    'fundingGoal: 20_000_000,\n      fundingRaised: 5_000_000,\n      volunteerQuota: 1,\n      volunteerCount: 1,'
);

fs.writeFileSync('prisma/seed.ts', content);
console.log('Seed updated for TC_02 (Full Activity)');
