// Vercel entry point. Vercel treats every file under /api as a serverless
// function; this just hands it the same Express app used for local runs,
// unmodified. See server.js for the require.main guard that keeps app.listen()
// from running in this context.
module.exports = require('../server');
