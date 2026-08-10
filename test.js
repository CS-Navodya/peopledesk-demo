// Minimal smoke test used by CI. Not a real test suite — just enough for the
// live demo to show a genuine, real green/red check in GitHub Actions.
const http = require('http');
const { spawn } = require('child_process');

const PORT = 3999;
const server = spawn('node', ['server.js'], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
server.stdout.on('data', (d) => { serverOutput += d; });
server.stderr.on('data', (d) => { serverOutput += d; });

let finished = false;
function done(code, msg) {
  if (finished) return;
  finished = true;
  if (msg) console.error('Smoke test failed:', msg);
  if (code !== 0) {
    console.error('--- server output ---');
    console.error(serverOutput || '(no output captured)');
    console.error('----------------------');
  } else {
    console.log('Smoke test passed: /api/health responded 200');
  }
  server.kill();
  process.exit(code);
}

// If the server process itself never starts (bad require, syntax error, port
// in use, missing dependency) fail loudly instead of just timing out silently.
server.on('error', (err) => done(1, `server process error: ${err.message}`));
server.on('exit', (code) => {
  if (!finished && code !== null) done(1, `server exited early with code ${code}`);
});

// Poll instead of a single fixed wait. 20s of headroom is generous on purpose —
// on a synced/cloud drive (OneDrive, Dropbox, etc.) or a slow disk, requiring
// express's ~30 sub-dependencies on first cold start can take several seconds
// longer than you'd expect, well past a naive 1-second wait.
const deadline = Date.now() + 20000;
function tryOnce() {
  http.get(`http://localhost:${PORT}/api/health`, (res) => {
    if (res.statusCode === 200) {
      done(0);
    } else if (Date.now() < deadline) {
      setTimeout(tryOnce, 300);
    } else {
      done(1, `unexpected status ${res.statusCode}`);
    }
  }).on('error', (err) => {
    if (Date.now() < deadline) {
      setTimeout(tryOnce, 300);
    } else {
      done(1, `${err.message} (server never became reachable on port ${PORT})`);
    }
  });
}
setTimeout(tryOnce, 300);
