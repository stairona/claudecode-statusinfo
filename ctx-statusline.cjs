#!/usr/bin/env node
/**
 * claudecode-statusinfo
 * Minimal Claude Code status bar showing CTX%, token count, and session duration.
 *
 * Claude Code passes session data as JSON via stdin to the statusLine command.
 * This script parses that JSON and outputs a clean one-line status.
 *
 * Output format:
 *   46% ctx    91k tks    2h 47m
 *
 * Install:
 *   1. Copy this file to your project's .claude/helpers/ folder
 *   2. Add to your .claude/settings.json:
 *      "statusLine": {
 *        "type": "command",
 *        "command": "node /path/to/ctx-statusline.cjs"
 *      }
 *
 * https://github.com/stairona/claudecode-statusinfo
 */

function formatTokens(n) {
  if (n === null || n === undefined) return null;
  if (n >= 1000) return `${Math.round(n / 1000)}k tks`;
  return `${n} tks`;
}

function formatDuration(ms) {
  if (ms === null || ms === undefined) return null;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (totalSeconds < 60) return '< 1m';
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatCtx(usedTokens, windowSize) {
  if (!usedTokens || !windowSize) return null;
  const pct = Math.round((usedTokens / windowSize) * 100);
  return `${pct}% ctx`;
}

let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  try {
    const json = JSON.parse(data);

    const ctx = json?.context_window;
    const cost = json?.cost;

    const usedTokens = ctx?.current_usage?.input_tokens ?? ctx?.total_input_tokens ?? null;
    const windowSize = ctx?.context_window_size ?? null;
    const durationMs = cost?.total_duration_ms ?? null;

    const ctxStr = formatCtx(usedTokens, windowSize);
    const tksStr = formatTokens(usedTokens);
    const durStr = formatDuration(durationMs);

    const parts = [ctxStr, tksStr, durStr].filter(Boolean);

    if (parts.length === 0) {
      process.stdout.write('● ctx\n');
      return;
    }

    process.stdout.write(parts.join('    ') + '\n');
  } catch {
    process.stdout.write('● ctx\n');
  }
});
