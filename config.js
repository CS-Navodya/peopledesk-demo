const fs = require('fs');
const path = require('path');

function loadEnvFile(filename) {
  const envPath = path.join(__dirname, filename);
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

// Node does not read .env by itself. Load .env first, then .env.example so a
// local `npm start` still works if the copy step was skipped.
loadEnvFile('.env');
loadEnvFile('.env.example');

// ============================================================================
// FIXED (Day 3): secrets no longer live in source. They're read from
// environment variables instead, following the pattern GitHub's own
// remediation guidance recommends after a push-protection / secret-scanning
// hit. See .env.example for the variable names — copy it to .env locally
// (already gitignored) and fill in real values, or set them in your host's
// dashboard (e.g. Render's Environment tab) for a deployed instance.
//
// The original commit that hardcoded these (see git history / the
// push-protection alert) is left in place on purpose — that's the "before"
// half of this demo. This file is the "after."
// ============================================================================

module.exports = {
  // TRAINING-FLAW #2 still applies even after rotation: this is a plaintext
  // comparison, no hashing (bcrypt/argon2), no salt. Moving the value out of
  // source fixes the "secret in git" problem, not the "plaintext password"
  // problem — that's a separate, deeper fix.
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
};
