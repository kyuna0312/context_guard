---
name: token-statusline
description: Claude Code only. Install the context-usage status line (script + settings.json statusLine). Use for "add token counter to status line", "show context usage in status bar".
---

# Token Status Line

Add live context window usage and CLAUDE.md token cost to the Claude Code status bar — visible at all times without asking.

## What It Shows

```
 context_forge   main  Fable 5  ctx ███████░░░ 72%  md ~952t 
```

Powerline segments in the tmux "Night City" palette (needs a Nerd Font for the `` separators):

- **dir / branch / model** — like a tmux `status-left`
- **ctx bar** — 10-char bar of context window usage (green → yellow → purple → red)
- **md ~Nt** — estimated tokens loaded from CLAUDE.md files (words × 1.3)

Rate limit usage appears only when near limits (≥70%) and on Claude.ai accounts.

## Quick Setup

`bash scripts/install.sh` (from the plugin repo) already performs Step 1 —
and backs up a modified copy before overwriting. Re-run it after updating
the plugin: the copy in `~/.claude/` does not update itself.

**Step 1**: Copy plugin script to a stable path (recommended — plugin path may change):

```bash
# Copy to permanent location
cp "${CLAUDE_PLUGIN_ROOT}/scripts/statusline-command.sh" ~/.claude/statusline-command.sh
chmod +x ~/.claude/statusline-command.sh
```

**Step 2**: Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash ~/.claude/statusline-command.sh",
    "refreshInterval": 30
  }
}
```

**Step 3**: Restart Claude Code. Status line appears at bottom of terminal.

## If an Existing Status Line Is Already Configured

If `settings.json` already has a `statusLine.command`, choose:

- **Replace**: Swap the `command` path to `statusline-command.sh`
- **Extend**: Add the bar rendering block to the existing script (see `references/statusline-setup.md` Option B)

## Color Thresholds

Context window:
- Green → under 50%
- Yellow → 50–74%
- Purple → 75–89%
- Red → 90%+ (compact now)

CLAUDE.md token cost:
- Green → under 390 tokens (optimal)
- Yellow → 390–779 (acceptable)
- Purple → 780–1299 (bloated)
- Red → 1300+ (optimize immediately)

## refreshInterval

```json
"refreshInterval": 30
```

Status line reruns every 30 seconds. Set lower (10) for faster updates; higher (60) for less CPU. Without `refreshInterval`, updates only on session events.

Requires Claude Code v2.1.97 or later.

## Manual Test

Test script output before wiring it up:

```bash
echo '{"context_window":{"used_percentage":72},"workspace":{"current_dir":"'"$PWD"'"},"model":{"display_name":"Fable 5"}}' \
  | bash ~/.claude/statusline-command.sh
```

Should print the segments with the full model name and `ctx ███████░░░ 72%`
plus the CLAUDE.md token count. If the model name renders truncated ("Fable"
without the "5"), the installed copy predates the field-separator fix —
re-run `install.sh`.

## Additional Resources

- **`references/statusline-setup.md`** — Full JSON input schema, all setup options, troubleshooting
- **`scripts/statusline-command.sh`** (plugin root) — the status line script itself (copy to `~/.claude/` for permanent use)
