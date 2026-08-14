# Runbook: build the artifacts, then run the live segment

You said you have several days before the session — use that time. A repo where
everything happened in the same five minutes looks staged; one with a few days of
real history looks like an actual project, which is the entire point of doing this
for real instead of mocking it.

## Day-by-day plan

**Day 1 — stand it up**
- Run locally, confirm it works (README section 1).
- Push to GitHub (README section 2). This is when push protection / secret
  scanning should fire — screenshot it immediately, don't wait.
- Open and merge one small PR with no branch protection in place — screenshot the
  merged-with-no-review state.

**Day 2 — let the automated signals land**
- Check the Security tab for the Dependabot alert on `lodash`. Screenshot it.
- Check the Actions tab for a green CI run. Screenshot it.
- If you're deploying live: connect Vercel, deploy, confirm the public URL works,
  screenshot the build log.

**Day 3 (or any day before) — add the "after"**
- Turn on branch protection (required PR review + required CI check).
- Open a second small PR and show it now can't merge until CI passes and someone
  approves. Screenshot both the blocked state and the resolved state.
- Rotate the fake secret out of `config.js` into an environment variable, commit
  that fix, and screenshot the diff — this is your "here's the fix" beat.

**1–2 days before the session**
- Full dry run of the live click-path below, timed.
- Re-check the Vercel URL still responds (see README) and warm it up before your slot.
- Export every screenshot into one folder in click-order as your fallback deck.

## Live segment script (5–10 minutes)

Keep one browser tab per stop, pre-opened, so you're never typing a URL live.

1. **(30s) Frame it.** "Forget the paperwork for a second — this is what someone on
   the client's security team actually clicks through."
2. **(90s) Repo tab.** Show the commit history and the merged-without-review PR
   from Day 1. Then show the branch-protection rule you added, and the second PR
   that got blocked until CI passed and someone approved it. "Before, and after."
3. **(60s) Security tab.** Point at the Dependabot alert on the old `lodash`
   version and the secret-scanning alert (or the blocked-push screenshot if that's
   what fired). "This isn't hypothetical — GitHub caught this the moment I pushed."
4. **(60s) The app itself.** Open the live URL (or localhost if you skipped Vercel),
   hit `/api/tickets` directly with no login, and read a customer's name and phone
   number out loud. This is the moment that lands hardest for a non-technical
   audience — they don't need to understand code to understand "I just saw
   someone's phone number with zero login."
5. **(60s) Logs.** Show the `console.log` line in `server.js`, then switch to the
   pre-opened Vercel dashboard's **Logs** tab for this project and log in on the
   live site — the `Login attempt -> username: admin, password: ...` line
   appears there in real time, password included. (Vercel logs aren't a local
   terminal — they only show up in the dashboard/`vercel logs` CLI, so open
   that tab ahead of time rather than trying to find it live.)
6. **(60s) Tie it back.** Overlay each thing you just showed against the
   consequences slide that follows: the unreviewed merge, the exposed endpoint, the
   logged password, the outdated dependency — each maps to a real audit finding
   category (ISO 27001 / SOC 2 exception, GDPR Art. 32, NIS2 Art. 21). This is what
   turns "cool demo" into "this is why the earlier slides matter."

## If live breaks

Company-wide audience, once chance — don't gamble on live wifi or a cold-started
Vercel function. Have the screenshot folder from your dry run ready as a second
tab/backup slide, and say out loud "here's what this looked like when I tested it
Tuesday" if anything doesn't cooperate live. Nobody will think less of you for that
— they'll think less of you for dead air.
