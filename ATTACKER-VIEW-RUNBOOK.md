# Alternate live segment: attacker's-eye view

**This is a pivot proposal, not a replacement.** RUNBOOK.md is untouched — this is a
second option for the live segment, built around the same repo and the same live
app, just told from a different angle. Compare the two and pick one (or blend them).

The problem with the original script: every beat was "look at this GitHub settings
page." That's real, but it reads as engineering process, not risk. This version
leads with a live exploit and uses the process stuff (branch protection, Dependabot,
secret scanning) as the *answer* to the scare, at the end, instead of the main event.

New supporting artifacts this script uses (both new, nothing existing was touched):
- `attacker-scrape.sh` — one command that dumps every "customer" record live
- `consequence-mockups.md` — the mock breach notice / headline / fine figure

## Live segment script (5–8 minutes)

**1. Cold open (20s).** No framing slide. Just say: "This morning, someone outside
the company found our public repo." Pull up the repo.

**2. The thing that doesn't go away (40s).** Open `config.js`'s git history — the
original commit with the hardcoded Slack webhook / AWS key is still there, even
though it's since been rotated. Say out loud: "Rotating a leaked secret stops it
from being used going forward. It does not erase the fact that it leaked — that
commit is permanent." Most people assume "we fixed it" means "it's gone." It doesn't.
This is a genuinely useful, slightly uncomfortable fact to leave people with.

**3. One command (60s).** Open a terminal (pre-opened, don't type it live from
memory). Run:

```bash
./attacker-scrape.sh https://peopledesk-demo.vercel.app
node attacker-scrape.js https://peopledesk-demo.vercel.app
```

It prints every fake customer's name, email, and phone number, with a line up top
noting no authentication was required. Read one entry out loud. Then say the scale
line: "That's 3 people in under a second. For a real system with 50,000 customers,
it's the exact same command." Do not undersell this by only showing 3 rows — say
the number out loud so the audience does the multiplication themselves.

**4. Raise the stakes on the password (30s).** Open the Vercel Logs tab, log in on
the live site, point at the plaintext password in the log line. Say: "Notice this
doesn't require anyone to break into the database — anyone who ever gets *read
access to logs*, which is a much lower bar, has the real admin credential in
plaintext."

**5. Consequence beat (90s) — new, this is the core of the pivot.** Switch to
`consequence-mockups.md` (or read straight from it / project it): the mock breach
notification email, the fake headline, and the actual GDPR fine ceiling (4% of
global annual turnover or ~€20M, whichever is higher — public knowledge, not legal
advice). Say: "This is what 'unauthenticated PII endpoint' actually turns into."

**6. The flip — how this gets caught (60s).** Now, and only now, show the repo
process side: the PR merged with no review (before), the branch-protection rule,
the second PR blocked until CI passed. Frame it explicitly as the answer to what
you just showed, not a separate feature: "This hole could have sat open for months
with nobody required to look at it. This is what closes that window — not because
process is exciting, but because it's the difference between a flaw found in
minutes and one found in months." Same for the Dependabot alert on `lodash` — "this
is the automated version of the same idea: something is watching, even when no one
remembers to check."

**7. Close (20s).** One line tying it back to the audience's own systems: "Every
piece of this was findable by a script or a settings page — nothing here needed a
sophisticated attacker."

## What's genuinely different from the original script

- Leads with a live exploit and a scale statement, not a settings-page tour.
- Adds a concrete "the rotation doesn't erase the leak" point — new information,
  not just a restated flaw.
- Adds a consequence beat (breach notice / fine / headline) — translates a
  technical finding into something the audience will actually remember.
- Repo/CI/Dependabot content is kept (nothing thrown away) but moved to the end
  and explicitly reframed as "how this gets caught," not shown for its own sake.

## Open question for you

Section 5 leans on a mocked breach-notification email with PeopleDesk as the
fictional company. Worth a gut-check before you use it live: is a mock breach
letter too close to something that could be mistaken for real if a screenshot of
it circulates without this context? If that's a concern, the fake headline + fine
figure alone still carry most of the weight without the letter.
