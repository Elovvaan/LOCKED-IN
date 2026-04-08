const fs = require('node:fs');
const path = require('node:path');

const outputPath = path.resolve(__dirname, '..', 'google-play-service-account.json');
const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;

if (!raw || raw.trim().length === 0) {
  console.error('Missing GOOGLE_PLAY_SERVICE_ACCOUNT_JSON.');
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(raw);
} catch {
  console.error('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is not valid JSON.');
  process.exit(1);
}

fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2));
console.log(`Wrote ${outputPath}`);
