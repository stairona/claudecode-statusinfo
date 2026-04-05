# claudecode-statusinfo

A minimal Claude Code status bar that shows **CTX%, token count, and session duration** — nothing else.

```
46% ctx    91k tks    2h 47m
```

## Why

Claude Code's `statusLine` feature lets you run a custom script that renders a status bar. Most existing solutions (like RuFlo) show a lot of information. This shows only what matters:

- **CTX%** — how much of the model's context window you've used. Tells you when to `/compact`.
- **Token count** — raw input tokens in the current session.
- **Duration** — how long the current session has been running.

## How It Works

Claude Code passes live session data as **JSON via stdin** to whatever command is set as `statusLine` in `settings.json`. This was discovered by capturing the stdin stream during an active session.

The JSON Claude Code sends looks like this:

```json
{
  "session_id": "...",
  "model": {
    "id": "stepfun/step-3.5-flash:free",
    "display_name": "stepfun/step-3.5-flash:free"
  },
  "cost": {
    "total_cost_usd": 0.27,
    "total_duration_ms": 10873
  },
  "context_window": {
    "total_input_tokens": 91899,
    "total_output_tokens": 262,
    "context_window_size": 200000,
    "current_usage": {
      "input_tokens": 91899,
      "output_tokens": 262,
      "cache_creation_input_tokens": 0,
      "cache_read_input_tokens": 0
    },
    "used_percentage": 46,
    "remaining_percentage": 54
  },
  "exceeds_200k_tokens": false
}
```

> **Note:** `context_window_size` reflects the actual model's context window — 200k for Claude models, 256k+ for others. CTX% is calculated from `total_input_tokens / context_window_size` so it's always accurate for your model.

## Install

### 1. Copy the script

```bash
# Copy to your workspace helpers folder
cp ctx-statusline.cjs ~/zprojects/.claude/helpers/ctx-statusline.cjs
```

### 2. Update settings.json

Add this to your `~/.claude/settings.json` or project-level `.claude/settings.json`:

```json
"statusLine": {
  "type": "command",
  "command": "node /Users/YOUR_USERNAME/zprojects/.claude/helpers/ctx-statusline.cjs"
}
```

Replace `/Users/YOUR_USERNAME/zprojects` with your actual path.

### 3. Restart Claude Code

The status bar will appear immediately on next launch.

## Output Format

```
46% ctx    91k tks    2h 47m
```

| Part | Description | Example |
|------|-------------|---------|
| `46% ctx` | Percentage of context window used | `46% ctx` |
| `91k tks` | Input tokens used this session | `91k tks`, `1.2k tks`, `500 tks` |
| `2h 47m` | Session duration | `< 1m`, `14m`, `1h 2m` |

Fields are separated by 4 spaces. If data isn't available yet (session just started), shows `● ctx`.

## Token Formatting

| Raw value | Displayed |
|-----------|-----------|
| `91899` | `91k tks` |
| `1200` | `1k tks` |
| `500` | `500 tks` |

## Duration Formatting

| Raw value | Displayed |
|-----------|-----------|
| `< 60s` | `< 1m` |
| `900000ms` | `15m` |
| `10020000ms` | `2h 47m` |

## Requirements

- Node.js (any version)
- Claude Code with `statusLine` support

## Discovered JSON Schema

The full JSON Claude Code passes to `statusLine` via stdin (as of Claude Code v2.1.92):

```json
{
  "session_id": "string",
  "transcript_path": "string",
  "cwd": "string",
  "model": {
    "id": "string",
    "display_name": "string"
  },
  "workspace": {
    "current_dir": "string",
    "project_dir": "string",
    "added_dirs": []
  },
  "version": "string",
  "output_style": {
    "name": "string"
  },
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

This schema is undocumented. If you find changes between Claude Code versions, please open an issue.

## License

MIT
