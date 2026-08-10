// ============================================================================
// TRAINING-FLAW #1: secrets hardcoded directly in source and committed to git,
// instead of environment variables / a secrets manager.
//
// This file is committed ON PURPOSE so the live demo can show GitHub Secret
// Scanning + Push Protection actually catching it in real time. Every value
// below is FAKE — none of these are live credentials for any real service.
//
// Do not copy this pattern into a real project.
// ============================================================================

module.exports = {
  // TRAINING-FLAW #2: plaintext password, no hashing (bcrypt/argon2), no salt.
  ADMIN_PASSWORD: "SuperSecret123!",

  // Fake Slack incoming-webhook URL. Matches the structural pattern GitHub's
  // secret scanning / push protection looks for. Not a real webhook.
  SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/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",

  // Fake AWS-style access key ID. Structurally valid format, not a live key.
  // Kept as a backup trigger in case the Slack pattern above doesn't fire in
  // your GitHub plan/region on the day you test this.
  AWS_ACCESS_KEY_ID: "AKIAZQ3XJK7LPMND2Q8H",
};
