const express = require('express');
const cors = require('cors');
const path = require('path');
const _ = require('lodash'); // TRAINING-FLAW #3: pinned to an old, vulnerable version — see package.json
const config = require('./config');

const app = express();

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

// ----------------------------------------------------------------------------
// TRAINING-FLAW #5 (the headline one): NO authentication or authorization on
// this route. Anyone who has the URL can read every customer's name, email,
// phone number, and support notes. This is the single most important flaw
// to show live — it's the "who can touch it" slide, made real.
// ----------------------------------------------------------------------------
app.get('/api/tickets', (req, res) => {
  res.json(tickets);
});

app.post('/api/tickets', (req, res) => {
  const { name, email, phone, issue, notes } = req.body;
  // TRAINING-FLAW #6: no input validation or sanitization at all.
  const ticket = { id: nextId++, name, email, phone, issue, notes };
  tickets.push(ticket);
  res.status(201).json(ticket);
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // TRAINING-FLAW #7: credentials logged in plaintext. In a real deployment
  // these logs often ship straight to a log aggregator — now the aggregator
  // has everyone's password too.
  console.log(`Login attempt -> username: ${username}, password: ${password}`);

  if (username === 'admin' && password === config.ADMIN_PASSWORD) {
    return res.json({ ok: true, token: 'not-a-real-session-token' });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PeopleDesk demo listening on port ${PORT}`));
