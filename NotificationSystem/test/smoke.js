/**
 * test/smoke.js
 * Side-effect-free smoke test: verifies key entry files parse without syntax errors.
 * Run: npm test
 */

const { execSync } = require('child_process');
const path = require('path');

const files = ['server.js', 'app.js'];
let failures = 0;

for (const file of files) {
  const abs = path.resolve(__dirname, '..', file);
  try {
    execSync(`node --check ${abs}`, { stdio: 'inherit' });
    console.log(`  ✓ ${file} — syntax OK`);
  } catch {
    console.error(`  ✗ ${file} — syntax error`);
    failures++;
  }
}

if (failures === 0) {
  console.log('\nAll smoke checks passed.');
  process.exit(0);
} else {
  console.error(`\n${failures} smoke check(s) failed.`);
  process.exit(1);
}
