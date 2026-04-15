# claudecode-statusinfo

![Node.js](https://img.shields.io/badge/node-any-brightgreen) ![License](https://img.shields.io/badge/license-MIT-green) ![Dependencies](https://img.shields.io/badge/dependencies-none-blue)

A minimal Claude Code status bar that shows **CTX%, token count, and session duration** — nothing else.

```
46% ctx    91k tks    2h 47m
```

## Why

Claude Code's `statusLine` feature lets you run a custom script that renders a status bar. Most solutions show a lot. This shows only what matters for a working session:

- **CTX%** — how full the context window is. Tells you when to `/compact`.
- **Token count** — raw input tokens used so far.
- **Duration** — how long the current session has been running.

No dependencies. Single file. Works with any model.

## Install

### 1. Copy the script

```bash
mkdir -p ~/.claude/helpers
cp ctx-statusline.cjs ~/.claude/helpers/ctx-statusline.cjs
```

### 2. Add to settings.json

Add to `~/.claude/settings.json` (global) or `.claude/settings.json` (project-level):

```json
{
  "statusLine": {
    "type": "command",
    "command": "node /Users/YOUR_USERNAME/.claude/helpers/ctx-statusline.cjs"
  }
}
```

Replace `YOUR_USERNAME` with your macOS username (`echo $USER`).

A ready-to-edit example is included: `settings.json.example`.

### 3. Restart Claude Code

The status bar appears immediately on next launch.

### Test without restarting

```bash
echo '{"cost":{"total_duration_ms":9000000},"context_window":{"total_input_tokens":91000,"context_window_size":200000,"current_usage":{"input_tokens":91000}}}' | node ctx-statusline.cjs
# → 45% ctx    91k tks    2h 30m
```

## Output Format

```
46% ctx    91k tks    2h 47m
```

| Field | What it shows | Examples |
|-------|--------------|---------|
| `46% ctx` | Context window used | `3% ctx`, `85% ctx` |
| `91k tks` | Input tokens this session | `500 tks`, `1k tks`, `91k tks` |
| `2h 47m` | Session duration | `< 1m`, `14m`, `1h 2m` |

Fields are separated by 4 spaces. Shows `● ctx` while session data is initializing.

## How It Works

Claude Code passes live session data as JSON via stdin to whatever command is set as `statusLine`. This script reads that JSON and outputs a single formatted line.

CTX% is calculated as `total_input_tokens / context_window_size`, so it's accurate regardless of model (200k for Claude, 256k+ for others).

## Discovered stdin JSON Schema

Claude Code sends this to the `statusLine` command on every update (as of Claude Code v2.1.92):

```json
{
  "session_id": "string",
  "transcript_path": "string",
  "cwd": "string",
  "model": { "id": "string", "display_name": "string" },
  "workspace": { "current_dir": "string", "project_dir": "string", "added_dirs": [] },
  "version": "string",
  "output_style": { "name": "string" },
  "cost": {
    "total_cost_usd": "number",
    "total_duration_ms": "number",
    "total_api_duration_ms": "number",
    "total_lines_added": "number",
    "total_lines_removed": "number"
  },
  "context_window": {
    "total_input_tokens": "number",
    "total_output_tokens": "number",
    "context_window_size": "number",
    "current_usage": {
      "input_tokens": "number",
      "output_tokens": "number",
      "cache_creation_input_tokens": "number",
      "cache_read_input_tokens": "number"
    },
    "used_percentage": "number",
    "remaining_percentage": "number"
  },
  "exceeds_200k_tokens": "boolean"
}
```

This schema is undocumented. If it changes between Claude Code versions, please open an issue.

## Requirements

- Node.js (any version)
- Claude Code with `statusLine` support

## License

MIT
