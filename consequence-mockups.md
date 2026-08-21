# Consequence mockups — for live use in the "attacker's-eye view" segment

**Entirely fictional. Training use only. Not a real incident, not a real company,
not a real regulator communication.** PeopleDesk and its three "customers" are
fictional throughout this whole project — this document is no different, it just
makes the fictional consequence visible instead of leaving it implied.

---

## Mock breach notification email

> **SPECIMEN — FOR INTERNAL TRAINING USE ONLY — NOT A REAL COMMUNICATION**
>
> **From:** privacy@peopledesk-demo.example
> **Subject:** Notice of a data security incident affecting your account
>
> Dear [Customer],
>
> We are writing to inform you of a data security incident that may have affected
> your personal information. On [date], we discovered that a support-ticket API
> endpoint did not require authentication, meaning your name, email address, phone
> number, and any notes attached to your support tickets were accessible to anyone
> with the URL, for an undetermined period of time.
>
> We have no evidence of malicious use at this time, but we are notifying you as a
> precaution. We recommend you remain alert to unusual contact referencing your
> support history.
>
> We have taken the following steps: the endpoint now requires authentication, the
> credential exposed in our logs has been rotated, and we have engaged outside
> counsel to assess our notification obligations under applicable law.
>
> [Fictional Data Protection Officer name], PeopleDesk

Use this by reading two or three lines aloud rather than the whole thing — the
point is the tone shift from "technical finding" to "letter with your name on it,"
not the full legal text.

---

## Mock headline

> **"Support platform left customer data open for months — no login required"**
> *— a fictional trade-press headline, for illustration only*

---

## The number that makes it concrete

GDPR's maximum fine for this class of violation (Article 32, security of
processing) is **up to 4% of global annual turnover, or €20 million — whichever is
higher.** This is public, general knowledge, not legal advice, and not a claim
about what would happen in any specific real case — the point is only that "a
security exception" and "a number with eight zeros" are the same finding described
two different ways.

NIS2 (Article 21) separately requires certain organizations to report significant
incidents within tight timelines (an initial notification within 24 hours in some
cases) — worth one line if your audience includes anyone in scope: the process
flaws shown earlier (no review, no gate) are exactly what make hitting that
timeline harder, because nobody was watching until it was too late.

---

## Scale line (say this out loud, don't just imply it)

"The live demo just showed you 3 fake customers in under a second. For a real
system with 50,000 customers, it is the exact same command."
