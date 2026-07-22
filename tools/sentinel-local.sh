#!/usr/bin/env bash
#
# Local fallback for the self-healing pipeline: run the drift sentinel and, on
# breakage, invoke the local Claude Code CLI (your subscription — no API key) to
# fix the selector and open a PR. Wire into cron/launchd for a machine-local
# sentinel when you'd rather not run the AI fixer in GitHub Actions.
#
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Running drift sentinel..."
if npm run sentinel; then
  echo "No drift — selectors healthy."
  exit 0
fi

echo "Drift detected. Invoking Claude Code to self-heal..."
claude -p "The drift sentinel failed. Read .sentinel/report.json and the .sentinel/dom-*.html captures of GitHub's current markup, fix the drifted selector(s) in src/selectors/targets/*.ts, regenerate the affected fixtures/*.html, and run 'npm test' and 'npm run sentinel' until both pass. Then commit to a new branch and open a PR with gh titled '[FIX] selectors: auto-heal selector drift'." \
  --allowedTools "Read,Edit,Write,Bash"
