const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const path = require('path');
const _ = require('lodash'); // TRAINING-FLAW #3: pinned to an old, vulnerable version — see package.json
const config = require('./config');

const app = express();

function signToken() {
  const payload = Buffer.from(JSON.stringify({
    u: 'admin',
    exp: Date.now() + 8 * 60 * 60 * 1000,
  })).toString('base64url');
  const secret = config.ADMIN_PASSWORD || 'demo-session';
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const secret = config.ADMIN_PASSWORD || 'demo-session';
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Login required' });
  }
  next();
}

// TRAINING-FLAW #4: wide-open CORS. Any website on the internet can call this API
// from a user's browser. A real app would allow-list known origins only.
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory "database", seeded with obviously fake people for the demo.
// Resets whenever the server restarts — that's intentional, it keeps every
// run of the demo starting from a clean, known state.
let tickets = [
  { id: 1, name: 'Kavindu Perera', email: 'kavindu.perera@example.com', phone: '+94 71 000 0001', issue: 'Cannot reset password', notes: 'Customer sounded frustrated on the call.' },
  { id: 2, name: 'Amara Silva', email: 'amara.silva@example.com', phone: '+94 71 000 0002', issue: 'Billing question', notes: 'Requested full invoice history.' },
  { id: 3, name: 'Nadeesha Fonseka', email: 'nadeesha.f@example.com', phone: '+94 71 000 0003', issue: 'Data export request', notes: 'GDPR-style access request — flagged for legal review.' },
];
let nextId = 4;

app.get('/api/tickets', requireAuth, (req, res) => {
  res.json(tickets);
});

app.post('/api/tickets', requireAuth, (req, res) => {
  const { name, email, phone, issue, notes } = req.body;
  // TRAINING-FLAW #6: no input validation or sanitization at all.
  const ticket = { id: nextId++, name, email, phone, issue, notes };
  console.log("tickets: ", tickets);
  tickets.push(ticket);
  res.status(201).json(ticket);
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // TRAINING-FLAW #7: credentials logged in plaintext. In a real deployment
  // these logs often ship straight to a log aggregator — now the aggregator
  // has everyone's password too.
  console.log(`Login attempt -> username: ${username}, password: ${password}`);

  if (username === 'admin' && password && password === config.ADMIN_PASSWORD) {
    return res.json({ ok: true, token: signToken() });
  }
  res.status(401).json({ ok: false });
});

// Harmless route that just proves which (vulnerable, outdated) lodash
// version shipped — handy to point at during the Dependabot part of the demo.
app.get('/api/_debug/lodash-version', (req, res) => {
  res.json({ version: _.VERSION });
});

// Used by uptime checks and the CI smoke test (test.js) to confirm the server booted.
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Vercel imports this file as a serverless function (see api/index.js) and
// calls the exported app directly — it never runs this file as a standalone
// process, so app.listen() only happens for local runs / Render / the CI
// smoke test in test.js, all of which do `node server.js` directly.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`PeopleDesk demo listening on port ${PORT}`));
}

module.exports = app;
