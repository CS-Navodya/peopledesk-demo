# PeopleDesk — live security/privacy teardown demo

**Training use only.** This is a deliberately flawed Node.js/Express app built for a
live "what does an auditor actually see when they look at our stack" demo. It holds
no real personal data — the three "customers" are fictional. Every flaw is commented
in the code with `TRAINING-FLAW #n` so you (the presenter) can find them fast, but the
audience won't see those comments unless you show the code on screen.

A quick note on how I tested this: the sandbox I built it in blocks outbound npm
registry access, so I verified every file's syntax (`node --check`) and traced the
logic by hand, but I could not run `npm install` myself. **Run `npm install && npm
test` locally as your very first step below** — if anything's off, it'll show up
immediately and there's plenty of runway to fix it before the session.

## What's flawed, and which slide it maps to

| Flaw | Where | Maps to |
|---|---|---|
| No auth on `/api/tickets` — anyone can read every customer's PII | `server.js` | Slide 5, "who can touch it" |
| Plaintext password, no hashing | `config.js` / `server.js` login | Slide 5, "who can touch it" |
| Hardcoded secrets committed to git (fake Slack webhook + AWS key) | `config.js` | Slide 5, "what the contract says" / proof-not-promises |
| Outdated dependency with a known CVE (`lodash@4.17.15`) | `package.json` | Slide 5, "proof, not promises" — this is what a real Dependabot alert looks like |
| Credentials logged in plaintext | `server.js` `/api/login` | Slide 11, "failing the check" — this is exactly the kind of thing an incident-response review finds |
| Wide-open CORS | `server.js` | General "no least privilege" theme |
| No branch protection (repo setting, not code) | GitHub repo settings | Slide 5, "who can touch it" / Slide 14 engineering card |

## Troubleshooting: "npm test fails" / hangs on ECONNREFUSED

If `npm test` fails with `connect ECONNREFUSED`, it's almost always a timing issue,
not a real bug: `test.js` boots the server as a child process and waits for it to
answer `/api/health`. On a fast local disk that's instant, but if this folder lives
on a synced drive (OneDrive, Dropbox, a network share, etc.), the first cold
`require('express')` — which pulls in ~30 small dependency files — can take far
longer than you'd expect, because each file read has extra round-trip latency.
`test.js` now polls for up to 20 seconds instead of checking once after 1 second,
and prints the server's real stdout/stderr on failure so you're never guessing. If
it still fails after that, the printed server output will show the actual error.

## 1. Run it locally first

```bash
cd peopledesk-demo
npm install
npm test        # should print "Smoke test passed"
node server.js  # visit http://localhost:3000
```

Confirm you can see the ticket list with no login, and that submitting the login
form with the wrong password fails and the right one (`admin` / `SuperSecret123!`)
succeeds.

## 2. Create the real GitHub repo

Use your **personal** GitHub account, **public** repo (per your earlier choice) —
public repos get secret scanning, push protection, and Dependabot alerts for free,
no admin approval needed.

```bash
cd peopledesk-demo
git init
git add .
git commit -m "Initial commit: PeopleDesk demo app"
gh repo create peopledesk-demo --public --source=. --remote=origin
git push -u origin main
```

(No `gh` CLI? Create the empty repo on github.com first, then `git remote add
origin <url>` and `git push -u origin main`.)

**This push is the moment that should trigger GitHub Push Protection** on the fake
Slack webhook / AWS key in `config.js` — GitHub will likely block the push in your
terminal with a message naming the detected secret and a bypass link. That blocked
push, screenshotted, is one of your strongest slides. If it doesn't block (scanning
coverage varies slightly by account type/region), it will instead appear as a
**Secret scanning alert** under the repo's **Security** tab within a few minutes —
either outcome works for the demo, but test this days ahead so you know which one
you're getting and can narrate it correctly live.

## 3. Confirm the other real signals appear

Within a few minutes to a few hours of the push, check the repo's **Security** tab
for:

- **Dependabot alerts** — should show at least one alert against `lodash@4.17.15`
  (prototype pollution / command injection advisories). If nothing shows after a
  day, go to Settings → Code security and enable Dependabot alerts explicitly (some
  accounts need this turned on once).
- **Secret scanning alerts** — the webhook/key from `config.js`, unless push
  protection already blocked it at commit time.

## 4. Set up the branch-protection before/after

Do this in two steps, days apart if you can, so the repo's history tells the story:

1. **Now, with no protection:** open a small PR (e.g. add a comment to
   `server.js`) and merge it yourself immediately, no review. This is your "before"
   — screenshot the merged PR showing no review requirement.
2. **A day or two later:** go to Settings → Branches → Add rule for `main`, require
   a pull request before merging and require the CI status check to pass. Open a
   second small PR — now merging is blocked until the "CI" check goes green. This is
   your "after."

## 5. Connect real CI (GitHub Actions)

Already included: `.github/workflows/ci.yml` runs `npm install && npm test` on every
push and PR. Once you've pushed, check the **Actions** tab for a real, green run —
this is what you show for "real deploy/build logs," no staging needed.

## 6. Deploy it live (optional but you asked for both)

Using [Render](https://render.com) (free plan, no credit card required historically —
confirm this hasn't changed when you sign up):

1. New → Web Service → connect your GitHub repo.
2. Render should auto-detect `render.yaml`. If not, set build command `npm install`
   and start command `node server.js`.
3. Deploy. You'll get a real public URL and a real, live build/deploy log in
   Render's dashboard — this is what you show for "here's what a deployment
   pipeline actually looks like."

**Wake it up 10–15 minutes before your slot** — Render's free tier sleeps after
inactivity and the first request after sleep can take 30–60 seconds, which is a bad
look live.

## Safety notes

- Everything here is fake: fictional names, fake secrets, no real customer or
  employee data.
- Don't reuse `config.js`'s patterns in any real project — that's the whole point of
  the demo.
- If GitHub ever partner-validates the fake AWS/Slack values against live services,
  they'll simply fail (they're not real), which is fine and expected.
